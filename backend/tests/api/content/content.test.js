/**
 * @fileoverview Integration tests for video access endpoint
 * @version 0.1.0
 * @author EXACTUM-dev
 * @description Tests video access control based on authentication, roles and privileges
 */

import { jest } from "@jest/globals";

// Mock modules before importing the controller so the controller receives the mocked functions
const modelPath = "../../../src/models/content.model.js";
const cloudfrontPath = "../../../src/utils/cloudfront.js";

jest.unstable_mockModule(modelPath, () => ({
  getAvailableContent: jest.fn(),
  getContentById: jest.fn(),
  createContent: jest.fn(),
  assignContentToPrivileges: jest.fn(),
}));

jest.unstable_mockModule(cloudfrontPath, () => ({
  generateSignedUrl: jest.fn(),
}));

// Import controller and the mocked modules
const contentController = await import(
  "../../../src/controllers/content.controller.js"
);
const contentModel = await import(modelPath);
const cloudfront = await import(cloudfrontPath);

describe("content.controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("show returns content with signed URLs", async () => {
    const mockContent = {
      IDContenido: 1,
      IDMultimedia: "videos/1.mp4",
      nombre: "Test Video",
      descripcion: "Desc",
      tipo: "video",
      tipoMembresia: "Basico",
      createdAt: "2021-01-01",
      thumbnailMultimedia: "images/1.jpg",
    };

    contentModel.getContentById.mockResolvedValue(mockContent);
    cloudfront.generateSignedUrl.mockImplementation(
      (key) => `https://signed/${key}`
    );

    const req = { params: { contentId: "1" } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await contentController.show(req, res);

    expect(contentModel.getContentById).toHaveBeenCalledWith("1");
    expect(cloudfront.generateSignedUrl).toHaveBeenCalledWith("videos/1.mp4");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        signedUrl: "https://signed/videos/1.mp4",
        contentData: expect.objectContaining({
          IDContenido: 1,
          titulo: "Test Video",
          tipo: "video",
        }),
      })
    );
  });

  test("show returns 404 when content not found", async () => {
    contentModel.getContentById.mockRejectedValue(
      new Error("Content not found")
    );

    const req = { params: { contentId: "2" } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await contentController.show(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "not_found" })
    );
  });

  test("index returns paginated content with thumbnails", async () => {
    const rows = [
      {
        IDContenido: 1,
        nombre: "A",
        descripcion: "D",
        tipo: "video",
        tipoMembresia: "Basico",
        createdAt: "2021-01-01",
        thumbnailMultimedia: "images/1.jpg",
      },
    ];

    contentModel.getAvailableContent.mockResolvedValue({
      content: rows,
      total: 1,
      hasMore: false,
    });
    cloudfront.generateSignedUrl.mockImplementation(
      (key) => `https://signed/${key}`
    );

    const req = { query: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await contentController.index(req, res);

    expect(contentModel.getAvailableContent).toHaveBeenCalledWith(
      10,
      0,
      null,
      null,
      "newest"
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.arrayContaining([
          expect.objectContaining({
            IDContenido: 1,
            thumbnailUrl: "https://signed/images/1.jpg",
          }),
        ]),
        total: 1,
        hasMore: false,
      })
    );
  });
});
