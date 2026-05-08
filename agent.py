from anthropic import Anthropic
from ddgs import DDGS
from dotenv import load_dotenv

load_dotenv()

client = Anthropic()

def buscar_informacion(query: str) -> str:
    with DDGS() as ddgs:
        resultados = list(ddgs.text(query, max_results=5))
    
    if not resultados:
        return "No se encontraron resultados."
    
    texto = ""
    for r in resultados:
        texto += f"Fuente: {r['href']}\n"
        texto += f"Título: {r['title']}\n"
        texto += f"Resumen: {r['body']}\n\n"
    
    return texto

def contrastar_noticia(noticia: str) -> str:
    print("\nBuscando información...\n")
    resultados = buscar_informacion(noticia)
    
    respuesta = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        system="""Eres un agente especializado en verificar noticias y detectar fake news.
        
Tu trabajo es:
1. Analizar la noticia que te dan
2. Revisar las fuentes encontradas
3. Determinar si la noticia es verdadera, falsa, o necesita más verificación
4. Explicar tu razonamiento de forma clara y sencilla

Sé directo, honesto y cita las fuentes que usas.""",
        messages=[
            {
                "role": "user",
                "content": f"""Noticia a verificar: {noticia}

Información encontrada en internet:
{resultados}

Analiza si esta noticia es verdadera, falsa o necesita más verificación."""
            }
        ]
    )
    
    return respuesta.content[0].text

def main():
    print("=== Agente de verificación de noticias ===\n")
    
    while True:
        noticia = input("Introduce una noticia o titular (o 'salir' para terminar):\n> ")
        
        if noticia.lower() == 'salir':
            break
            
        if not noticia.strip():
            continue
        
        resultado = contrastar_noticia(noticia)
        print("\n--- ANÁLISIS ---")
        print(resultado)
        print("\n" + "="*50 + "\n")

if __name__ == "__main__":
    main()