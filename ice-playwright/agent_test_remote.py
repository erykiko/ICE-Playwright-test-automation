import asyncio
import os
import sys
from browser_use import Agent, Browser
from browser_use.llm.litellm import ChatLiteLLM


DEFAULT_MODEL = "gemini/gemini-2.5-flash"


async def run_web_test(target: str, test_scenario: str, model_name: str = DEFAULT_MODEL):
    """
    Uruchamia agenta LLM do przetestowania wskazanej strony.
    Wersja remote używa nie-lokalnego modelu Gemini przez LiteLLM.
    """
    if os.path.exists(target) and target.endswith(".html"):
        target_url = f"file://{os.path.abspath(target)}"
    else:
        target_url = target

    if model_name.startswith("ollama/"):
        raise ValueError("Ten skrypt jest przeznaczony dla nie-lokalnego LLM, nie Ollamy.")

    print(f"[+] Cel testu: {target_url}")
    print(f"[+] Scenariusz: {test_scenario}")
    print(f"[+] Model remote: {model_name}\n")

    llm = ChatLiteLLM(
        model=model_name,
        api_key="gemini_api_key",
        temperature=0,
    )

    browser = Browser(headless=False)

    full_instruction = (
        f"Przejdź pod adres: {target_url}. "
        f"Następnie wykonaj następujący test funkcjonalny: {test_scenario}. "
        f"Po zakończeniu testu zwróć jednoznaczny raport: czy test przeszedł (PASS), "
        f"czy wystąpił błąd (FAIL) wraz z uzasadnieniem."
    )

    agent = Agent(
        task=full_instruction,
        llm=llm,
        browser=browser,
        use_thinking=False,
        enable_planning=False,
        max_failures=3,
    )

    try:
        history = await agent.run(max_steps=30)
        print("\n[=] HISTORIA AKCJI AGENTA:")
        for result in history.action_results():
            if result.extracted_content:
                print(f"- {result.extracted_content}")
            elif result.error:
                print(f"- Błąd: {result.error}")

        print("\n[+] WYNIK KOŃCOWY:")
        print(history.final_result())

    except Exception as e:
        print(f"\n[-] Krytyczny błąd agenta: {e}", file=sys.stderr)
    finally:
        await browser.close()


if __name__ == "__main__":
    TARGET_URL = "http://localhost:3000"

    TEST_TASK = (
        "Na stronie logowania wykonaj test w tej kolejności: "
        "1. Znajdź przycisk albo przełącznik zmiany motywu i kliknij go. "
        "Sprawdź, czy wygląd strony zmienił się na ciemny motyw. "
        "2. Znajdź pola logowania. Wpisz losowe, niepoprawne dane, na przykład "
        "random@example.com oraz wrong-password, a następnie spróbuj się zalogować. "
        "Sprawdź, czy aplikacja odrzuciła logowanie albo pokazała błąd. "
        "3. Wyczyść pola, wpisz poprawne dane: email gemma@example.com oraz hasło password, "
        "a następnie spróbuj się zalogować. "
        "Na końcu zwróć raport PASS tylko wtedy, gdy motyw ciemny zadziałał, "
        "niepoprawne dane zostały odrzucone, a poprawne dane zalogowały użytkownika. "
        "Jeśli któregokolwiek elementu nie da się znaleźć lub któryś krok nie działa, zwróć FAIL."
    )

    model = os.getenv("REMOTE_LLM_MODEL", DEFAULT_MODEL)
    asyncio.run(run_web_test(target=TARGET_URL, test_scenario=TEST_TASK, model_name=model))
