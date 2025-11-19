import { v2 as cloudinary } from "cloudinary";
import { writeFileSync, unlinkSync } from "fs";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const imageStore = {
  uploadImage: async function (imagefile) {
    const tempPath = `./public/temp-${Date.now()}.img`;
    writeFileSync(tempPath, imagefile);
    const response = await cloudinary.uploader.upload(tempPath, {
      folder: "placemark-core",
      resource_type: "auto",
      type: "private",
    });
    unlinkSync(tempPath);

    const signedUrl = cloudinary.url(response.public_id, {
      type: "private",
      sign_url: true,
      secure: true,
    });

    return {
      url: signedUrl,
      publicId: response.public_id,
    };
  },

  getSignedUrl: function (publicId) {
    return cloudinary.url(publicId, {
      type: "private",
      sign_url: true,
      secure: true,
    });
  },

  extractPublicId: function (url) {
    try {
      const urlParts = url.split("/");
      const privateIndex = urlParts.findIndex(part => part === "private");

      if (privateIndex !== -1) {
        let startIndex = privateIndex + 2;

        if (urlParts[startIndex] && urlParts[startIndex].match(/^v\d+$/)) {
          startIndex += 1;
        }

        const pathParts = urlParts.slice(startIndex);
        const fullPath = pathParts.join("/").split("?")[0];
        const publicId = fullPath.replace(/\.[^/.]+$/, "");

        return publicId;
      }
      return null;
    } catch (err) {
      console.error("Error extracting public_id:", err);
      return null;
    }
  },

  deleteImage: async function (publicId) {

    await cloudinary.uploader.destroy(publicId, {
      type: "private",
      invalidate: true,
    });
  },
};


