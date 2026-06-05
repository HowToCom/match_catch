const { z } = require("zod");

const registerSchema = z.object({
  student_id: z.string().min(5, "학번은 최소 5자 이상이어야 합니다."),
  username: z.string().min(3, "아이디는 최소 3자 이상이어야 합니다."),
  password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다."),
});

const loginSchema = z.object({
  username: z.string().min(1, "아이디를 입력해주세요."),
  password: z.string().min(1, "비밀번호를 입력해주세요."),
});

module.exports = {
  registerSchema,
  loginSchema,
};