import bcrypt from "bcrypt";

const hash = "$2b$10$s0wHJStC5X1ASa2m7M9ehOKAAftzZMp6mC0L9CuzHrN1/2lX5BpMa";
const password = "admin123";

bcrypt.compare(password, hash).then(result => {
  console.log("Совпадает?", result);
});
