
import { GoogleGenAI, Type, Schema, Chat, GenerateContentResponse } from "@google/genai";
import { NoteAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    riskScore: {
      type: Type.INTEGER,
      description: "0-100 score indicating risk level. 100 is high risk (likely to be shadowbanned), 0 is safe.",
    },
    violationKeywords: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of specific words found in the input that trigger violation filters (e.g., '最', '第一', medical claims, directing to WeChat).",
    },
    violationAnalysis: {
      type: Type.STRING,
      description: "Expert analysis of why the content might be limited in traffic or banned, referencing specific algorithm rules.",
    },
    optimizedTitle: {
      type: Type.STRING,
      description: "A viral, click-worthy title, under 20 characters, using emojis, following Xiaohongshu style.",
    },
    optimizedContent: {
      type: Type.STRING,
      description: "Rewritten content. Engaging, authentic tone (KOL/KOC style), emoji-rich, structured with line breaks. Removes violations.",
    },
    recommendedTags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Top 10 most relevant and high-traffic hashtags. Do not include the # symbol in the string.",
    },
  },
  required: ["riskScore", "violationKeywords", "violationAnalysis", "optimizedTitle", "optimizedContent", "recommendedTags"],
};

export const analyzeNote = async (title: string, content: string): Promise<NoteAnalysis> => {
  const prompt = `
    作为小红书平台的资深算法架构师和运营专家，请你审核以下笔记草稿。
    你深知小红书的"CES"（社区生态评分）模型，以及最新的违规词库（如绝对化用语、导流违规、虚假宣传、医疗用语等）。

    用户输入标题: "${title}"
    用户输入正文: "${content}"

    请执行以下操作：
    1. **违规检测**：精准识别文中的违规词、敏感词、甚至可能导致限流的低质词汇。
    2. **风险评估**：给出0-100的风险分（分越高越危险）。
    3. **深度优化**：
       - **标题**：必须控制在20字以内！要足够吸睛（震惊体、提问体、干货体），带上适合的Emoji。
       - **正文**：去除所有违规词。使用“集美”、“绝绝子”、“亲测”等小红书原生感的语言风格（但也保持专业性）。排版要清晰，多用Emoji分割。
       - **话题**：推荐10个以内的高热度、精准垂直的话题标签。

    请以JSON格式返回结果。
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        systemInstruction: "你是一个极其严格的小红书内容审核系统，同时也是一位极其擅长打造爆款笔记的运营专家。",
      },
    });

    const text = response.text;
    if (!text) {
        throw new Error("No response from AI");
    }
    return JSON.parse(text) as NoteAnalysis;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};

// Chat Functionality
export const createChatSession = (): Chat => {
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: "你是一个小红书爆款运营助手。你的风格活泼、专业、善用Emoji。你可以回答关于小红书运营机制、流量密码、账号定位、内容选题等方面的问题。回答要简短精炼，干货满满。",
    }
  });
};

export const streamChatResponse = async function* (chat: Chat, message: string) {
  try {
    const result = await chat.sendMessageStream({ message });
    for await (const chunk of result) {
      const c = chunk as GenerateContentResponse;
      if (c.text) {
        yield c.text;
      }
    }
  } catch (error) {
    console.error("Chat Stream Error:", error);
    yield "抱歉，由于网络原因，我现在无法回答，请稍后再试。";
  }
};
