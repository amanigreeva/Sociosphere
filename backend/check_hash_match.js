const bcrypt = require('bcryptjs');

const hash = '$2a$10$4kb.LJHanjyUoWjLjPrUsN9OHk3YKREqiGGtvbJN/.3BiQ6TUeiy.B6'; // From previous step output

const check = async () => {
    const isMoni1234 = await bcrypt.compare('moni@1234', hash);
    console.log(`Matches 'moni@1234'? ${isMoni1234}`);

    const isMoni123 = await bcrypt.compare('moni@123', hash);
    console.log(`Matches 'moni@123'? ${isMoni123}`);
};

check();
