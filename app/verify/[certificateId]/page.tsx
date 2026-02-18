
import dbConnect from "@/lib/db-connect";
import mongoose from "mongoose";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{
    certificateId: string;
  }>;
}

export default async function VerifyCertificate({ params }: Props) {
  const { certificateId } = await params;

  let certificate = null;

  try {
    await dbConnect();

    // Use aggregation with $limit to avoid TypeScript issues
    const certificates = await mongoose.connection.db
      .collection('certificates')
      .find({ certificateId })
      .limit(1)
      .toArray();

    certificate = certificates[0] || null;
  } catch (error) {
    console.error("Database connection error:", error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center p-6 bg-zinc-900 rounded-xl border border-red-500/20">
          <h1 className="text-2xl font-bold text-red-500 mb-2">
            System Error
          </h1>
          <p className="text-gray-400">
            Unable to verify certificate at this time. Please try again later.
          </p>
          <div className="mt-4 text-xs text-zinc-600 font-mono text-left bg-black p-2 rounded overflow-auto max-w-sm mx-auto">
            {error instanceof Error ? error.message : "Unknown error"}
          </div>
        </div>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-500">
            ❌ Invalid Certificate
          </h1>
          <p className="mt-4 text-gray-400">
            The certificate ID provided does not exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="bg-zinc-900 p-8 rounded-xl shadow-lg w-full max-w-lg">
        <h1 className="text-2xl font-bold text-green-400 mb-6">
          ✅ Certificate Verified
        </h1>

        <div className="space-y-3">
          <p>
            <span className="font-semibold">Name:</span>{" "}
            {certificate.participantName}
          </p>
          <p>
            <span className="font-semibold">Event:</span>{" "}
            {certificate.eventName}
          </p>
          <p>
            <span className="font-semibold">Role:</span>{" "}
            {certificate.role}
          </p>
          <p>
            <span className="font-semibold">Issued On:</span>{" "}
            {new Date(certificate.createdAt).toLocaleDateString()}
          </p>
          <p>
            <span className="font-semibold">Certificate ID:</span>{" "}
            {certificate.certificateId}
          </p>
        </div>
      </div>
    </div>
  );
}
