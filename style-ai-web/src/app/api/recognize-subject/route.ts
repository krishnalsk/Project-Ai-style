// src/app/api/recognize-subject/route.ts
import { NextResponse } from "next/server";
import { inspectImageModalityAsync } from "@/lib/imageInspector";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { image, imageId, modalityHint } = body;

    if (!image || typeof image !== "string") {
      return NextResponse.json(
        { status: "error", error: "Please provide an image payload." },
        { status: 400 }
      );
    }

    const currentImageId = imageId || ("rec_" + Date.now() + "_" + Math.random().toString(36).substring(2, 8));
    const inspection = await inspectImageModalityAsync(image, modalityHint || "auto");

    return NextResponse.json({
      status: "success",
      imageId: currentImageId,
      recognition: {
        detectedSubject: inspection.detectedSubject,
        objectCategory: inspection.objectCategory,
        detectedFeatures: inspection.detectedFeatures,
        recommendedModality: inspection.recommendedModality,
        confidence: inspection.confidence,
        confidenceTier: inspection.confidenceTier,
        selectionReason: inspection.selectionReason,
        alternativeCategories: inspection.alternativeCategories,
        isUnrelatedObject: inspection.isUnrelatedObject,
        modality: inspection.modality,
        isLowQuality: inspection.isLowQuality,
        qualityWarning: inspection.qualityWarning,
        skinObservations: inspection.skinObservations,
        weaveCharacteristics: inspection.weaveCharacteristics,
      },
    });
  } catch (err: any) {
    console.error("[Recognize Subject API Error]", err);
    return NextResponse.json(
      { status: "error", error: "Failed to recognize image subject." },
      { status: 500 }
    );
  }
}
