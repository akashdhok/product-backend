const generateUsername = () => {
    const chars = "QWERTYUIOPASFGHJKLZXCVBNM1234567890";
    let username = "";
    for (let i = 0; i < 8; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        username += chars[randomIndex];
    }
    return username;
};

// Example usage
console.log(generateUsername());
module.exports = generateUsername;