import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "vecolombia/vehicles";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No se seleccionó ningún archivo de imagen" },
        { status: 400 }
      );
    }

    // Convert file to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary using upload_stream
    const uploadPromise = new Promise<{ secure_url: string; public_id: string }>(
      (resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: "auto",
            transformation: [{ quality: "auto", fetch_format: "auto" }],
          },
          (error, result) => {
            if (error || !result) {
              reject(error || new Error("Error en la subida a Cloudinary"));
            } else {
              resolve({
                secure_url: result.secure_url,
                public_id: result.public_id,
              });
            }
          }
        );
        uploadStream.end(buffer);
      }
    );

    const result = await uploadPromise;

    return NextResponse.json({
      success: true,
      message: "¡Imagen subida exitosamente a Cloudinary!",
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error: any) {
    console.error("Error subiendo imagen a Cloudinary:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Error al procesar la imagen",
      },
      { status: 500 }
    );
  }
}
