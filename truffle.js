require('babel-register');
require('babel-polyfill');

module.exports = {
    networks: {
        development: {
            host: 'localhost',
            port: 8545,
            network_id: '*', // Match any network id
            gas: 0xfffffffffff,
            gasPrice: 0x01
        },
        coverage: {
            host: "localhost",
            network_id: "*",
            port: 8555,
            gas: 0xfffffffffff,
            gasPrice: 0x01
        },
        ropsten:  {
            network_id: 3,
            host: "127.0.0.1",
            port: 8545,
            gas: 2900000
        }
    },
    rpc: {
        host: '127.0.0.1',
        post: 8080
    },
    mocha: {
        useColors: true,
        slow: 30000,
        bail: true
    }
};
