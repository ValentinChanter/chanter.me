import bcrypt from 'bcryptjs';

async function main() {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync('PASS', salt);

    console.log(hash);
}

main();