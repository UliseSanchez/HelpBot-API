// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Input, Button, List, Card, Typography, Space, Layout, ConfigProvider, Modal } from 'antd';
import { SendOutlined, RobotOutlined, UserOutlined, GlobalOutlined, PaperClipOutlined, CloseCircleOutlined } from '@ant-design/icons';
import BotFormattedReply from './BotFormattedReply';

const { TextArea } = Input;
const { Title, Text } = Typography;
const { Header, Content, Footer } = Layout;

function App() {
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [popupUrl, setPopupUrl] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      const base64 = dataUrl.split(',')[1];
      setSelectedImage({ base64, mimeType: file.type, previewUrl: dataUrl });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await axios.get('http://localhost:8001/history/test_user');
        const history = response.data.history.map(msg => ({
          role: msg.role,
          content: msg.content
        }));
        setChatLog(history);
      } catch (error) {
        console.error("No se pudo cargar el historial", error);
      }
    };
    loadHistory();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [chatLog]);

  const sendMessage = async () => {
    if (!message.trim() && !selectedImage) return;

    setLoading(true);
    const userMessage = {
      role: 'user',
      content: message,
      imagePreview: selectedImage?.previewUrl || null,
    };
    setChatLog((prev) => [...prev, userMessage]);
    const currentMessage = message;
    const currentImage = selectedImage;
    setMessage('');
    setSelectedImage(null);

    try {
      const response = await axios.post('http://localhost:8001/chat', {
        user_id: "test_user",
        message: currentMessage,
        image_base64: currentImage?.base64 || null,
        image_mime_type: currentImage?.mimeType || null,
      });

      if (response.data.redirect_url) {
        setChatLog((prev) => [...prev, { role: 'assistant', content: response.data.reply }]);
        setTimeout(() => { window.location.href = response.data.redirect_url; }, 1500);
        return;
      }

      setChatLog((prev) => [...prev, { role: 'assistant', content: response.data.reply }]);

      if (response.data.popup_url) {
        setPopupUrl(response.data.popup_url);
      }
    } catch (error) {
      console.error("Error conectando con el bot:", error);
      setChatLog((prev) => [...prev, { role: 'assistant', content: "Error: No pude conectarme con el servidor." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#1677ff' } }}>
      <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
        <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#001529', height: '80px', width: '100%' }}>
          <Title level={1} style={{ color: 'white', margin: 0, letterSpacing: '2px' }}>
            HELPBOT API
          </Title>
        </Header>

        <Content style={{ padding: '24px', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', width: '100%' }}>
          <Card
            bordered={false}
            style={{ width: '100%', maxWidth: '1000px', height: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', borderRadius: '12px' }}
            styles={{ body: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' } }}
          >
            <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', paddingRight: '10px', marginBottom: '20px' }}>
              <List
                dataSource={chatLog}
                renderItem={(item) => (
                  <List.Item style={{ justifyContent: item.role === 'user' ? 'flex-end' : 'flex-start', border: 'none', padding: '12px 0', display: 'flex', width: '100%' }}>
                    <div style={{ display: 'flex', flexDirection: item.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-start', maxWidth: '80%', width: '100%', justifyContent: 'flex-start' }}>
                      <div style={{ margin: item.role === 'user' ? '0 0 0 12px' : '0 12px 0 0', display: 'flex', alignItems: 'center' }}>
                        {item.role === 'user' ? <UserOutlined style={{ fontSize: '20px' }} /> : <RobotOutlined style={{ fontSize: '20px' }} />}
                      </div>
                      <div style={{ backgroundColor: item.role === 'user' ? '#1677ff' : '#ffffff', color: item.role === 'user' ? 'white' : '#000000d9', padding: '12px 18px', borderRadius: item.role === 'user' ? '18px 18px 0 18px' : '18px 18px 18px 0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: item.role === 'user' ? 'none' : '1px solid #f0f0f0', flex: '0 1 auto', minWidth: '50px', wordBreak: 'break-word', textAlign: 'left' }}>
                        {item.imagePreview && (
                          <img src={item.imagePreview} alt="captura" style={{ maxWidth: '220px', maxHeight: '180px', borderRadius: '8px', marginBottom: item.content ? '8px' : 0, display: 'block' }} />
                        )}
                        {item.role === 'assistant' ? (
                          <BotFormattedReply content={item.content} />
                        ) : (
                          item.content && <Text style={{ color: 'inherit', fontSize: '15px', display: 'inline-block' }}>{item.content}</Text>
                        )}
                      </div>
                    </div>
                  </List.Item>
                )}
              />
              {loading && (
                <div style={{ textAlign: 'left', padding: '10px 0' }}>
                  <Text type="secondary" italic>El bot está pensando...</Text>
                </div>
              )}
            </div>

            {/* Preview de imagen seleccionada */}
            {selectedImage && (
              <div style={{ marginBottom: '8px', position: 'relative', display: 'inline-block' }}>
                <img src={selectedImage.previewUrl} alt="preview" style={{ height: '64px', borderRadius: '8px', border: '1px solid #d9d9d9' }} />
                <CloseCircleOutlined
                  onClick={() => setSelectedImage(null)}
                  style={{ position: 'absolute', top: -8, right: -8, fontSize: '18px', color: '#ff4d4f', cursor: 'pointer', background: 'white', borderRadius: '50%' }}
                />
              </div>
            )}

            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageSelect} />

            <Space.Compact style={{ width: '100%' }}>
              <Button
                icon={<PaperClipOutlined />}
                onClick={() => fileInputRef.current.click()}
                style={{ height: 'auto', borderRadius: '8px 0 0 8px' }}
                title="Adjuntar imagen"
              />
              <TextArea
                rows={2}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onPressEnter={(e) => { if (!e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder="Escribe un mensaje o adjunta una captura de pantalla..."
                style={{ borderRadius: 0 }}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={sendMessage}
                loading={loading}
                style={{ height: 'auto', width: '100px', borderRadius: '0 8px 8px 0' }}
              >
                Enviar
              </Button>
            </Space.Compact>
          </Card>
        </Content>

        <Footer style={{ textAlign: 'center', color: '#8c8c8c' }}>
          HelpBot API ©2026
        </Footer>
      </Layout>

      <Modal
        open={!!popupUrl}
        onCancel={() => setPopupUrl(null)}
        footer={null}
        width={520}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: '#001529', borderRadius: '6px', padding: '4px 10px' }}>
              <span style={{ color: 'white', fontWeight: 'bold', fontSize: '14px', letterSpacing: '1px' }}>HELPBOT</span>
            </div>
            <span style={{ color: '#555', fontSize: '14px' }}>Página oficial relacionada</span>
          </div>
        }
      >
        <div style={{ textAlign: 'center', padding: '24px 0 12px' }}>
          <GlobalOutlined style={{ fontSize: '44px', color: '#1677ff', marginBottom: '16px' }} />
          <p style={{ fontSize: '15px', marginBottom: '8px' }}>Te llevamos a la página oficial del gobierno.</p>
          <p style={{ fontSize: '12px', color: '#aaa', marginBottom: '28px', wordBreak: 'break-all' }}>{popupUrl}</p>
          <Space>
            <Button
              type="primary"
              size="large"
              icon={<GlobalOutlined />}
              onClick={() => { window.open(popupUrl, '_blank', 'width=1100,height=750,scrollbars=yes,resizable=yes'); setPopupUrl(null); }}
            >
              Abrir página oficial
            </Button>
            <Button size="large" onClick={() => setPopupUrl(null)}>Cancelar</Button>
          </Space>
        </div>
      </Modal>
    </ConfigProvider>
  );
}

export default App;
