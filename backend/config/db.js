import mongoose from 'mongoose';

const connectDB = async () => {
  let uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/beverage_dealer';
  const localUri = process.env.LOCAL_MONGODB_URI || 'mongodb://localhost:27017/beverage_dealer';

  // Check if Atlas password placeholder is present
  if (uri.includes('<db_password>')) {
    console.warn(
      '\n⚠️  [MongoDB Config] MONGODB_URI in backend/.env contains the placeholder <db_password>.'
    );
    console.warn(
      '👉 To connect to MongoDB Atlas Cluster0, replace <db_password> with your actual database user password in backend/.env.\n'
    );
    console.log(`🔄 Using local MongoDB for uninterrupted operation: ${localUri}`);
    uri = localUri;
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    if (uri !== localUri) {
      try {
        console.log(`🔄 Attempting fallback to local MongoDB (${localUri})...`);
        const fallbackConn = await mongoose.connect(localUri);
        console.log(`✅ MongoDB Connected (Local Fallback): ${fallbackConn.connection.host}/${fallbackConn.connection.name}`);
        return;
      } catch (fallbackError) {
        console.error(`❌ Local fallback also failed: ${fallbackError.message}`);
      }
    }
    process.exit(1);
  }
};

export default connectDB;

