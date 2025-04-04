import bcrypt from "bcryptjs";

export const hashPassword = async (password) => {
  const saltRound = 10;
  const hashPassword = await bcrypt.hash(password, saltRound);
  return hashPassword;
};

export const isPasswordValid = async (password, usersPassword) => {
  const isPasswordValid = await bcrypt.compare(password, usersPassword);
  return isPasswordValid;
}