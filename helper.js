import bcrypt from 'bcrypt';


export async function hashing(Password){
 const salt = await bcrypt.genSalt(10);
 const hashed = await bcrypt.hash(Password,salt)
 console.log(hashed);
 return hashed
}
export async function comparing(Password,user){
  const comparingpassword = bcrypt.compare(Password,user.Password)
    return comparingpassword
}

