const config = {
  challenge: false, // Set to true if you want to enable password protection.
  version: 1, // if u change this the code will break, its a SmarterBackend varible
  users: {
    // You can add multiple users by doing username: 'password'.
    username: "password",
  },
  routes: true, // Change this to false if you just want to host a bare server.
  envusers: false, //DISABLED ON PI VERSION
};
export default config;
