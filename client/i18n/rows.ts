export const rowText = {
  "zh-CN": {
    copy: "复制内容", copied: "已复制，再次复制", copyFailed: "复制失败，请选择文本手动复制",
    linkFailed: "（无法打开链接，请复制原文中的地址）", code: "代码", codeScroll: "代码，可横向滚动",
    reasoning: "思考过程", thinking: "思考中", collapse: "收起", expand: "展开",
    running: "运行中", completed: "已完成", failed: "失败", canceled: "已取消",
  },
  en: {
    copy: "Copy content", copied: "Copied. Copy again", copyFailed: "Copy failed. Select the text to copy it manually.",
    linkFailed: " (Could not open the link. Copy its address from the source.)", code: "Code", codeScroll: "Code, scroll horizontally",
    reasoning: "Reasoning", thinking: "Thinking", collapse: "Collapse", expand: "Expand",
    running: "Running", completed: "Completed", failed: "Failed", canceled: "Canceled",
  },
  hi: {
    copy: "सामग्री कॉपी करें", copied: "कॉपी हो गया। फिर कॉपी करें", copyFailed: "कॉपी नहीं हुआ। टेक्स्ट चुनकर मैन्युअल रूप से कॉपी करें।",
    linkFailed: " (लिंक नहीं खुला। स्रोत से उसका पता कॉपी करें।)", code: "कोड", codeScroll: "कोड, क्षैतिज स्क्रॉल करें",
    reasoning: "विचार प्रक्रिया", thinking: "विचार कर रहा है", collapse: "समेटें", expand: "खोलें",
    running: "चल रहा है", completed: "पूरा हुआ", failed: "असफल", canceled: "रद्द",
  },
} satisfies Record<"en" | "zh-CN" | "hi", Record<string, string>>;
export type RowText = { [K in keyof typeof rowText.en]: string };
