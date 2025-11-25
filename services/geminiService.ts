import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateSiteDescription = async (title: string, url: string): Promise<string> => {
  try {
    const prompt = `
      웹사이트 정보:
      URL: ${url}
      제목: ${title}

      요청사항:
      이 웹사이트에 대한 짧고 매력적이며 전문적인 설명을 한국어로 작성해주세요.
      제약사항:
      1. 최대 2문장으로 작성할 것.
      2. 이모지는 사용하지 말 것.
      3. 명확하고 간결하게 작성할 것.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "설명을 생성하는 중 오류가 발생했습니다. 직접 입력해주세요.";
  }
};
