const nameRegex = name =>
  RegExp("^(?=.*[\\p{L}].*[\\p{L}]).{2,}$", "gu").test(name);
const emailRegex = email =>
  RegExp(
    "^[a-zA-Z0-9][a-zA-Z0-9.!#$%&'*+\\/=?^_`{|}~-]*@[a-zA-Z0-9-]{2,}(\\.[a-zA-Z0-9]{2,})+$",
    "g"
  ).test(email);
const atLeastOneUpperCaseValidation = password =>
  RegExp("[A-Z]+").test(password);
const atLeastOneLowerCaseValidation = password =>
  RegExp("[a-z]+").test(password);
const atLeastOneDigitValidation = password => RegExp("\\d+").test(password);
const passwordLengthValidation = password => RegExp("^.{8,20}$").test(password);
const fullPasswordValidation = password =>
  atLeastOneUpperCaseValidation(password) &&
  atLeastOneLowerCaseValidation(password) &&
  atLeastOneDigitValidation(password) &&
  passwordLengthValidation(password);

module.exports = {
  fullPasswordValidation,
  emailRegex,
  nameRegex
}
