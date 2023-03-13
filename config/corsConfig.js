const corsOptions = {
  // origin:process.env.CLIENT_URL,
  origin: true,
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};

module.exports = corsOptions;
