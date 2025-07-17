import bcrypt from 'bcryptjs';

async function testPasswordHash() {
  const password = 'password123';
  const existingHash = '$2b$12$LQv3c1yqBwlVHpPjrCpCQu3/5ejzSUIMHX/HCDz8nw.CzVS.9W7Cy';
  
  console.log('Testing password:', password);
  console.log('Existing hash:', existingHash);
  
  const isValid = await bcrypt.compare(password, existingHash);
  console.log('Password validation result:', isValid);
  
  // Generate new hash for verification
  const newHash = await bcrypt.hash(password, 12);
  console.log('New generated hash:', newHash);
  
  const newHashValid = await bcrypt.compare(password, newHash);
  console.log('New hash validation result:', newHashValid);
}

testPasswordHash().catch(console.error);
