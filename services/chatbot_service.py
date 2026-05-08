from services.ai_service import ai_service

TOPIC_URLS = {
    "curp": "https://www.gob.mx/curp",
    "pensión del bienestar": "https://www.gob.mx/bienestar",
    "pension del bienestar": "https://www.gob.mx/bienestar",
    "bienestar": "https://www.gob.mx/bienestar",
    "inapam": "https://www.gob.mx/inapam",
    "imss": "https://www.imss.gob.mx",
    "nss": "https://serviciosdigitales.imss.gob.mx/gestionAsegurados-web-externo/asignacionNSS;JSESSIONIDASEGEXTERNO=wgW345f86fDQUA06ughdhdq72L0khGmrtYfayNfGr8j2R2Xxonxa!1077617938",
    "número de seguridad social": "https://serviciosdigitales.imss.gob.mx/gestionAsegurados-web-externo/asignacionNSS;JSESSIONIDASEGEXTERNO=wgW345f86fDQUA06ughdhdq72L0khGmrtYfayNfGr8j2R2Xxonxa!1077617938",
    "numero de seguridad social": "https://www.imss.gob.mx",
    "seguridad social": "https://www.imss.gob.mx",
    "issste": "https://www.issste.gob.mx",
    "cita sat": "https://citas.sat.gob.mx/",
    "sat": "https://www.sat.gob.mx",
}


def get_popup_url(text: str) -> str | None:
    for keyword, url in TOPIC_URLS.items():
        if keyword in text:
            return url
    return None


def message_handler(message: str, context: str = "", image_bytes: bytes = None, image_mime_type: str = None) -> dict:
    text = message.lower()
    if "cita" in text and "sat" in text:
        return {
            "reply": "Puedo ayudarte a sacar una cita en el SAT. Sera redireccionado a la pagina oficial. ¿Desea continuar?",
            "options": ["Si, llevarme a la pagina de citas del SAT", "No, gracias"],
            "action": "redirect_sat_citas",
            "popup_url": None,
        }
    response = ai_service.ask(message, context, image_bytes, image_mime_type)
    return {
        "reply": response,
        "options": [],
        "action": None,
        "popup_url": get_popup_url(text),
    }
