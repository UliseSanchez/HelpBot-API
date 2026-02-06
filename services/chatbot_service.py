from services.ai_service import ai_service

def message_handler (message: str, context: str="") -> dict:
    text = message.lower()
    if "cita" in text and "sat" in text:
        return {"reply": 
            "Puedo ayudarte a sacar una cita en el SAT. Sera redireccionado a la pagina oficial. ¿Desea continuar?",
            "options": ["Si, llevarme a la pagina de citas del SAT", "No, gracias"],
            "action": "redirect_sat_citas"
            }
    response = ai_service.ask(message, context) 
    return {
        "reply": response,
        "options": [],
        "action": None
    }