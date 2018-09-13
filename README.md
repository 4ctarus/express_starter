# express_starter
### Installation
##### Requires [Node.js](https://nodejs.org/)  and [Redis](https://redis.io/)  to run.

with aws cognito

- Install the dependencies and devDependencies
```sh
$ cd <folder>
$ yarn install
$ node run dev | prod
```

- Generate an RSA keypair with a 2048 bit private key[edit]
`$ openssl genpkey -algorithm RSA -out private_key.pem -pkeyopt rsa_keygen_bits:2048`

- Extracting the public key from an RSA keypair[edit]
`$ openssl rsa -pubout -in private_key.pem -out public_key.pem`

- create .env file  (check the config file)

> for ssl provide cert & key file
https://www.akadia.com/services/ssh_test_certificate.html

