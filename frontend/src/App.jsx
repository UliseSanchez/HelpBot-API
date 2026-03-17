// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Input, Button, List, Card, Typography, Space, Layout, ConfigProvider } from 'antd';
import { SendOutlined, RobotOutlined, UserOutlined } from '@ant-design/icons';
import BotFormattedReply from './BotFormattedReply';

const { TextArea } = Input;
const { Title, Text } = Typography;
const { Header, Content, Footer } = Layout;

function App() {
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  // Cargar historial al iniciar
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await axios.get('http://localhost:8000/history/test_user');
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

  // Auto-scroll al recibir nuevos mensajes
  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('.ant-list-items');
      if (scrollContainer) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }
  }, [chatLog]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    setLoading(true);
    const userMessage = { role: 'user', content: message };
    setChatLog((prev) => [...prev, userMessage]);
    setMessage('');

    try {
      const response = await axios.post('http://localhost:8000/chat', {
        user_id: "test_user_1",
        message: message
      });

      if (response.data.redirect_url) {
        setChatLog((prev) => [...prev, { role: 'assistant', content: response.data.reply }]);
        setTimeout(() => {
          window.location.href = response.data.redirect_url;
        }, 1500);
        return;
      }

      const botReply = { role: 'assistant', content: response.data.reply };
      setChatLog((prev) => [...prev, botReply]);
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
        <Header style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          background: '#001529',
          height: '80px',
          width: '100%' // Aseguramos que el header ocupe todo el ancho
        }}>
          <Title level={1} style={{ color: 'white', margin: 0, letterSpacing: '2px' }}>
            HELPBOT API   
          </Title>
        </Header>

        <Content style={{ 
          padding: '24px', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'flex-start', 
          width: '100%' 
        }}>
          <Card 
            bordered={false}
            style={{ 
              width: '100%', 
              maxWidth: '1000px', 
              height: '85vh',
              display: 'flex', 
              flexDirection: 'column',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
              borderRadius: '12px'
            }}
            styles={{ body: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' } }}
          >
            <div 
              ref={scrollRef}
              style={{ flex: 1, overflowY: 'auto', paddingRight: '10px', marginBottom: '20px' }}
            >
             <List
                dataSource={chatLog}
                renderItem={(item) => (
                  <List.Item style={{ 
                    justifyContent: item.role === 'user' ? 'flex-end' : 'flex-start',
                    border: 'none',
                    padding: '12px 0',
                    display: 'flex', // Asegura que el contenedor sea flex
                    width: '100%'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: item.role === 'user' ? 'row-reverse' : 'row', 
                      alignItems: 'flex-start',
                      maxWidth: '80%', // El conjunto de icono + mensaje puede ocupar hasta el 80%
                      width: '100%',
                      justifyContent: item.role === 'user' ? 'flex-start' : 'flex-start'
                    }}>
                      {/* Icono */}
                      <div style={{ 
                        margin: item.role === 'user' ? '0 0 0 12px' : '0 12px 0 0',
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                        {item.role === 'user' ? <UserOutlined style={{ fontSize: '20px' }} /> : <RobotOutlined style={{ fontSize: '20px' }} />}
                      </div>

                      {/* Burbuja de Texto */}
                      <div style={{ 
                        backgroundColor: item.role === 'user' ? '#1677ff' : '#ffffff', 
                        color: item.role === 'user' ? 'white' : '#000000d9',
                        padding: '12px 18px',
                        borderRadius: item.role === 'user' ? '18px 18px 0 18px' : '18px 18px 18px 0',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                        border: item.role === 'user' ? 'none' : '1px solid #f0f0f0',
                        // --- Ajustes clave ---
                        flex: '0 1 auto', // Permite que la burbuja crezca pero no obligatoriamente al 100%
                        minWidth: '50px',
                        wordBreak: 'break-word',
                        textAlign: 'left'
                      }}>
                        {item.role === 'assistant' ? (
                          <BotFormattedReply content={item.content} />
                        ) : (
                          <Text style={{ color: 'inherit', fontSize: '15px', display: 'inline-block' }}>
                            {item.content}
                          </Text>
                        )}
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            </div>
            
            <Space.Compact style={{ width: '100%' }}>
              <TextArea 
                rows={2} 
                value={message} 
                onChange={(e) => setMessage(e.target.value)}
                onPressEnter={(e) => {
                  if (!e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Escribe un mensaje al bot..." 
                style={{ borderRadius: '8px 0 0 8px' }}
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
    </ConfigProvider>
  );
}

export default App;