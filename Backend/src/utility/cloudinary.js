import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'
import { ApiError } from './ApiError.js';
import { asyncHandler } from './asyncHandler.js';




    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET 
      });



const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    const response = await cloudinary.uploader.upload(localFilePath, { resource_type: "auto" });
    console.log('File uploaded Successfully', response.url);
    fs.unlink(localFilePath, (err) => {
      if (err) console.error('Error deleting local file:', err);
    });
    return response;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    try { fs.unlinkSync(localFilePath); } catch {}
    return null;
  }
};

const deleteFromCloudinary = async (cloudinaryFilepath) => {
  try{
       if(!cloudinaryFilepath) return null
       const fileName = cloudinaryFilepath.split("/").pop().split(".")[0]
       
       const response = await cloudinary.uploader.destroy(fileName)
       return response
   
  }catch(err){
throw new ApiError(500, "unable to delete", err.message)

  }
}

export { uploadOnCloudinary, deleteFromCloudinary }