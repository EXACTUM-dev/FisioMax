/**
 * @fileoverview Unit tests for generateAndUploadCertificate function
 * @version 1.0.0
 * @author EXACTUM-dev
 * @description Tests certificate generation, S3 upload, and email sending
 */

import "../setup.js";
import { jest } from "@jest/globals";

// Create mock functions
const mockGetUserByMembershipId = jest.fn();
const mockUpdateUserCertificate = jest.fn();
const mockCreateCertificate = jest.fn();
const mockUploadFile = jest.fn();
const mockSendWelcomeEmail = jest.fn();

// Mock all external dependencies before importing the function
jest.unstable_mockModule("../../src/models/users.model.js", () => ({
    getUserByMembershipId: mockGetUserByMembershipId,
    updateUserCertificate: mockUpdateUserCertificate,
    getUserById: jest.fn(),
    getUsuarioByClerkId: jest.fn(),
    getUserByClerkId: jest.fn(),
}));

jest.unstable_mockModule("../../src/utils/certificate.js", () => ({
    createCertificate: mockCreateCertificate,
}));

jest.unstable_mockModule("../../src/services/s3Service.js", () => ({
    default: {
        uploadFile: mockUploadFile,
        deleteFile: jest.fn(),
        getPresignedUploadUrl: jest.fn(),
    },
}));

jest.unstable_mockModule("../../src/services/emailServices.js", () => ({
    sendWelcomeEmail: mockSendWelcomeEmail,
    sendRejectionEmail: jest.fn(),
    sendRenewalReminder: jest.fn(),
    sendDiscountNotification: jest.fn(),
    FRONTEND_URL: 'http://localhost:3000',
}));

jest.unstable_mockModule("../../src/services/notificationCronJob.js", () => ({
    checkAndNotifyNewDiscounts: jest.fn(),
}));

// Mock other dependencies that might be imported
jest.unstable_mockModule("../../src/models/content.model.js", () => ({
    getAvailableContent: jest.fn(),
    getContentById: jest.fn(),
    createContent: jest.fn(),
    assignContentToPrivileges: jest.fn(),
    updateContent: jest.fn(),
    softDeleteContent: jest.fn(),
    getActiveDiscounts: jest.fn(),
}));

jest.unstable_mockModule("../../src/models/roles.model.js", () => ({
    findRoleById: jest.fn(),
    getPrivilegeIdsByRole: jest.fn(),
}));

jest.unstable_mockModule("../../src/utils/cloudfront.js", () => ({
    generateSignedUrl: jest.fn(),
}));

jest.unstable_mockModule("../../src/utils/sanitization.js", () => ({
    sanitizeContentInput: jest.fn((input) => input),
}));

// Import the function to test (must be after mocks)
const { generateAndUploadCertificate } = await import("../../src/controllers/content.controller.js");

describe("generateAndUploadCertificate - Unit Tests", () => {
    // Sample test data
    const mockMembershipId = 123;
    const mockMembershipData = {
        nombres: "Juan Carlos",
        apellidoP: "Pérez",
        apellidoM: "García",
        membresiaTipo: "Profesional en Fisioterapia",
        membresiaFechaVencimiento: "2025-12-31",
        membresiaNoAfiliado: "FIS-2025-001",
        correo: "juan.perez@example.com",
    };

    const mockPdfBytes = {
        buffer: Buffer.from("mock-pdf-content"),
        filename: "certificado_JUAN_CARLOS_PEREZ_GARCIA.pdf",
        mimeType: "application/pdf",
    };

    const mockS3Url = "https://s3.amazonaws.com/bucket/membresias/certificate-123.pdf";

    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    describe("Successful certificate generation", () => {
        it("should generate and upload certificate successfully with all data", async () => {
            // Arrange
            mockGetUserByMembershipId.mockResolvedValue(mockMembershipData);
            mockCreateCertificate.mockResolvedValue(mockPdfBytes);
            mockUploadFile.mockResolvedValue(mockS3Url);
            mockUpdateUserCertificate.mockResolvedValue(true);
            mockSendWelcomeEmail.mockResolvedValue(true);

            // Act
            const result = await generateAndUploadCertificate(mockMembershipId);

            // Assert
            expect(result.generated).toBe(true);
            expect(result.url).toBe(mockS3Url);
            expect(result.key).toBe(mockS3Url);

            // Verify getUserByMembershipId was called correctly
            expect(mockGetUserByMembershipId).toHaveBeenCalledWith(mockMembershipId);
            expect(mockGetUserByMembershipId).toHaveBeenCalledTimes(1);

            // Verify createCertificate was called with correct parameters
            expect(mockCreateCertificate).toHaveBeenCalledWith({
                nombres: mockMembershipData.nombres,
                apellidoP: mockMembershipData.apellidoP,
                apellidoM: mockMembershipData.apellidoM,
                membresiaTipo: mockMembershipData.membresiaTipo,
                vigencia: "DICIEMBRE 2025",
                membresiaNoAfiliado: mockMembershipData.membresiaNoAfiliado,
            });
            expect(mockCreateCertificate).toHaveBeenCalledTimes(1);

            // Verify S3 upload was called correctly
            expect(mockUploadFile).toHaveBeenCalledWith(
                {
                    originalname: mockPdfBytes.filename,
                    mimetype: mockPdfBytes.mimeType,
                    buffer: mockPdfBytes.buffer,
                },
                "membresias"
            );
            expect(mockUploadFile).toHaveBeenCalledTimes(1);

            // Verify certificate was updated in database
            expect(mockUpdateUserCertificate).toHaveBeenCalledWith(mockMembershipId, mockS3Url);
            expect(mockUpdateUserCertificate).toHaveBeenCalledTimes(1);

            // Verify welcome email was sent
            expect(mockSendWelcomeEmail).toHaveBeenCalledWith(
                mockMembershipData.correo,
                "Juan Carlos Pérez García",
                mockPdfBytes
            );
            expect(mockSendWelcomeEmail).toHaveBeenCalledTimes(1);
        });

        it("should handle member with only one last name", async () => {
            // Arrange
            const memberWithOneLastName = {
                ...mockMembershipData,
                apellidoM: null,
            };
            mockGetUserByMembershipId.mockResolvedValue(memberWithOneLastName);
            mockCreateCertificate.mockResolvedValue(mockPdfBytes);
            mockUploadFile.mockResolvedValue(mockS3Url);
            mockUpdateUserCertificate.mockResolvedValue(true);
            mockSendWelcomeEmail.mockResolvedValue(true);

            // Act
            const result = await generateAndUploadCertificate(mockMembershipId);

            // Assert
            expect(result.generated).toBe(true);
            expect(mockSendWelcomeEmail).toHaveBeenCalledWith(
                memberWithOneLastName.correo,
                "Juan Carlos Pérez",
                mockPdfBytes
            );
        });

        it("should format date correctly for different months", async () => {
            // Arrange - Test with January
            const memberJanuary = {
                ...mockMembershipData,
                membresiaFechaVencimiento: "2026-01-15",
            };
            mockGetUserByMembershipId.mockResolvedValue(memberJanuary);
            mockCreateCertificate.mockResolvedValue(mockPdfBytes);
            mockUploadFile.mockResolvedValue(mockS3Url);
            mockUpdateUserCertificate.mockResolvedValue(true);
            mockSendWelcomeEmail.mockResolvedValue(true);

            // Act
            await generateAndUploadCertificate(mockMembershipId);

            // Assert
            expect(mockCreateCertificate).toHaveBeenCalledWith(
                expect.objectContaining({
                    vigencia: "ENERO 2026",
                })
            );
        });

        it("should format date correctly for June", async () => {
            // Arrange - Test with June
            const memberJune = {
                ...mockMembershipData,
                membresiaFechaVencimiento: "2025-06-30",
            };
            mockGetUserByMembershipId.mockResolvedValue(memberJune);
            mockCreateCertificate.mockResolvedValue(mockPdfBytes);
            mockUploadFile.mockResolvedValue(mockS3Url);
            mockUpdateUserCertificate.mockResolvedValue(true);
            mockSendWelcomeEmail.mockResolvedValue(true);

            // Act
            await generateAndUploadCertificate(mockMembershipId);

            // Assert
            expect(mockCreateCertificate).toHaveBeenCalledWith(
                expect.objectContaining({
                    vigencia: "JUNIO 2025",
                })
            );
        });
    });

    describe("Error handling - Membership not found", () => {
        it("should return error when membership does not exist", async () => {
            // Arrange
            mockGetUserByMembershipId.mockResolvedValue(null);

            // Act
            const result = await generateAndUploadCertificate(mockMembershipId);

            // Assert
            expect(result.generated).toBe(false);
            expect(result.error).toBe("Membership not found");

            // Verify no other services were called
            expect(mockCreateCertificate).not.toHaveBeenCalled();
            expect(mockUploadFile).not.toHaveBeenCalled();
            expect(mockUpdateUserCertificate).not.toHaveBeenCalled();
            expect(mockSendWelcomeEmail).not.toHaveBeenCalled();
        });

        it("should return error when membership is undefined", async () => {
            // Arrange
            mockGetUserByMembershipId.mockResolvedValue(undefined);

            // Act
            const result = await generateAndUploadCertificate(999);

            // Assert
            expect(result.generated).toBe(false);
            expect(result.error).toBe("Membership not found");
        });
    });

    describe("Error handling - PDF generation failures", () => {
        it("should handle PDF generation error", async () => {
            // Arrange
            mockGetUserByMembershipId.mockResolvedValue(mockMembershipData);
            mockCreateCertificate.mockRejectedValue(new Error("PDF generation failed"));

            // Act
            const result = await generateAndUploadCertificate(mockMembershipId);

            // Assert
            expect(result.generated).toBe(false);
            expect(result.error).toBe("PDF generation failed");

            // Verify S3 and email were not called
            expect(mockUploadFile).not.toHaveBeenCalled();
            expect(mockSendWelcomeEmail).not.toHaveBeenCalled();
        });

        it("should handle template file not found error", async () => {
            // Arrange
            mockGetUserByMembershipId.mockResolvedValue(mockMembershipData);
            mockCreateCertificate.mockRejectedValue(new Error("ENOENT: no such file or directory"));

            // Act
            const result = await generateAndUploadCertificate(mockMembershipId);

            // Assert
            expect(result.generated).toBe(false);
            expect(result.error).toContain("ENOENT");
        });
    });

    describe("Error handling - S3 upload failures", () => {
        it("should handle S3 upload error", async () => {
            // Arrange
            mockGetUserByMembershipId.mockResolvedValue(mockMembershipData);
            mockCreateCertificate.mockResolvedValue(mockPdfBytes);
            mockUploadFile.mockRejectedValue(new Error("S3 upload failed"));

            // Act
            const result = await generateAndUploadCertificate(mockMembershipId);

            // Assert
            expect(result.generated).toBe(false);
            expect(result.error).toBe("S3 upload failed");

            // Verify email was not sent
            expect(mockSendWelcomeEmail).not.toHaveBeenCalled();
        });

        it("should handle S3 network timeout", async () => {
            // Arrange
            mockGetUserByMembershipId.mockResolvedValue(mockMembershipData);
            mockCreateCertificate.mockResolvedValue(mockPdfBytes);
            mockUploadFile.mockRejectedValue(new Error("Network timeout"));

            // Act
            const result = await generateAndUploadCertificate(mockMembershipId);

            // Assert
            expect(result.generated).toBe(false);
            expect(result.error).toBe("Network timeout");
        });
    });

    describe("Error handling - Database update failures", () => {
        it("should handle database update error", async () => {
            // Arrange
            mockGetUserByMembershipId.mockResolvedValue(mockMembershipData);
            mockCreateCertificate.mockResolvedValue(mockPdfBytes);
            mockUploadFile.mockResolvedValue(mockS3Url);
            mockUpdateUserCertificate.mockRejectedValue(new Error("Database connection lost"));

            // Act
            const result = await generateAndUploadCertificate(mockMembershipId);

            // Assert
            expect(result.generated).toBe(false);
            expect(result.error).toBe("Database connection lost");

            // Verify email was not sent
            expect(mockSendWelcomeEmail).not.toHaveBeenCalled();
        });
    });

    describe("Error handling - Email sending failures", () => {
        it("should handle email sending error", async () => {
            // Arrange
            mockGetUserByMembershipId.mockResolvedValue(mockMembershipData);
            mockCreateCertificate.mockResolvedValue(mockPdfBytes);
            mockUploadFile.mockResolvedValue(mockS3Url);
            mockUpdateUserCertificate.mockResolvedValue(true);
            mockSendWelcomeEmail.mockRejectedValue(new Error("Email service unavailable"));

            // Act
            const result = await generateAndUploadCertificate(mockMembershipId);

            // Assert
            expect(result.generated).toBe(false);
            expect(result.error).toBe("Email service unavailable");
        });

        it("should handle invalid email address error", async () => {
            // Arrange
            mockGetUserByMembershipId.mockResolvedValue(mockMembershipData);
            mockCreateCertificate.mockResolvedValue(mockPdfBytes);
            mockUploadFile.mockResolvedValue(mockS3Url);
            mockUpdateUserCertificate.mockResolvedValue(true);
            mockSendWelcomeEmail.mockRejectedValue(new Error("Invalid email address"));

            // Act
            const result = await generateAndUploadCertificate(mockMembershipId);

            // Assert
            expect(result.generated).toBe(false);
            expect(result.error).toBe("Invalid email address");
        });
    });

    describe("Edge cases and data validation", () => {
        it("should handle member with very long names", async () => {
            // Arrange
            const memberWithLongName = {
                ...mockMembershipData,
                nombres: "Juan Carlos Alberto Francisco",
                apellidoP: "Pérez-Rodríguez",
                apellidoM: "García-Martínez",
            };
            mockGetUserByMembershipId.mockResolvedValue(memberWithLongName);
            mockCreateCertificate.mockResolvedValue(mockPdfBytes);
            mockUploadFile.mockResolvedValue(mockS3Url);
            mockUpdateUserCertificate.mockResolvedValue(true);
            mockSendWelcomeEmail.mockResolvedValue(true);

            // Act
            const result = await generateAndUploadCertificate(mockMembershipId);

            // Assert
            expect(result.generated).toBe(true);
            expect(mockSendWelcomeEmail).toHaveBeenCalledWith(
                memberWithLongName.correo,
                "Juan Carlos Alberto Francisco Pérez-Rodríguez García-Martínez",
                mockPdfBytes
            );
        });

        it("should handle member with special characters in names", async () => {
            // Arrange
            const memberWithSpecialChars = {
                ...mockMembershipData,
                nombres: "José María",
                apellidoP: "Ñuñez",
                apellidoM: "O'Brien",
            };
            mockGetUserByMembershipId.mockResolvedValue(memberWithSpecialChars);
            mockCreateCertificate.mockResolvedValue(mockPdfBytes);
            mockUploadFile.mockResolvedValue(mockS3Url);
            mockUpdateUserCertificate.mockResolvedValue(true);
            mockSendWelcomeEmail.mockResolvedValue(true);

            // Act
            const result = await generateAndUploadCertificate(mockMembershipId);

            // Assert
            expect(result.generated).toBe(true);
            expect(mockCreateCertificate).toHaveBeenCalledWith(
                expect.objectContaining({
                    nombres: "José María",
                    apellidoP: "Ñuñez",
                    apellidoM: "O'Brien",
                })
            );
        });

        it("should handle membership with long type name", async () => {
            // Arrange
            const memberWithLongType = {
                ...mockMembershipData,
                membresiaTipo: "Profesional en Fisioterapia Especializado en Rehabilitación Deportiva",
            };
            mockGetUserByMembershipId.mockResolvedValue(memberWithLongType);
            mockCreateCertificate.mockResolvedValue(mockPdfBytes);
            mockUploadFile.mockResolvedValue(mockS3Url);
            mockUpdateUserCertificate.mockResolvedValue(true);
            mockSendWelcomeEmail.mockResolvedValue(true);

            // Act
            const result = await generateAndUploadCertificate(mockMembershipId);

            // Assert
            expect(result.generated).toBe(true);
            expect(mockCreateCertificate).toHaveBeenCalledWith(
                expect.objectContaining({
                    membresiaTipo: memberWithLongType.membresiaTipo,
                })
            );
        });

        it("should handle year change correctly (December to January)", async () => {
            // Arrange
            const memberDecember = {
                ...mockMembershipData,
                membresiaFechaVencimiento: "2025-12-31",
            };
            mockGetUserByMembershipId.mockResolvedValue(memberDecember);
            mockCreateCertificate.mockResolvedValue(mockPdfBytes);
            mockUploadFile.mockResolvedValue(mockS3Url);
            mockUpdateUserCertificate.mockResolvedValue(true);
            mockSendWelcomeEmail.mockResolvedValue(true);

            // Act
            await generateAndUploadCertificate(mockMembershipId);

            // Assert
            expect(mockCreateCertificate).toHaveBeenCalledWith(
                expect.objectContaining({
                    vigencia: "DICIEMBRE 2025",
                })
            );
        });
    });

    describe("Integration flow verification", () => {
        it("should execute all steps in correct order", async () => {
            // Arrange
            const callOrder = [];

            mockGetUserByMembershipId.mockImplementation(async (id) => {
                callOrder.push("getUserByMembershipId");
                return mockMembershipData;
            });

            mockCreateCertificate.mockImplementation(async (data) => {
                callOrder.push("createCertificate");
                return mockPdfBytes;
            });

            mockUploadFile.mockImplementation(async (file, folder) => {
                callOrder.push("uploadFile");
                return mockS3Url;
            });

            mockUpdateUserCertificate.mockImplementation(async (id, url) => {
                callOrder.push("updateUserCertificate");
                return true;
            });

            mockSendWelcomeEmail.mockImplementation(async (email, name, pdf) => {
                callOrder.push("sendWelcomeEmail");
                return true;
            });

            // Act
            await generateAndUploadCertificate(mockMembershipId);

            // Assert - Verify correct execution order
            expect(callOrder).toEqual([
                "getUserByMembershipId",
                "createCertificate",
                "uploadFile",
                "updateUserCertificate",
                "sendWelcomeEmail",
            ]);
        });

        it("should not proceed if early step fails", async () => {
            // Arrange
            const callOrder = [];

            mockGetUserByMembershipId.mockImplementation(async (id) => {
                callOrder.push("getUserByMembershipId");
                return mockMembershipData;
            });

            mockCreateCertificate.mockImplementation(async (data) => {
                callOrder.push("createCertificate");
                throw new Error("PDF failed");
            });

            mockUploadFile.mockImplementation(async (file, folder) => {
                callOrder.push("uploadFile");
                return mockS3Url;
            });

            // Act
            await generateAndUploadCertificate(mockMembershipId);

            // Assert - Should stop after createCertificate fails
            expect(callOrder).toEqual([
                "getUserByMembershipId",
                "createCertificate",
            ]);
            expect(callOrder).not.toContain("uploadFile");
        });
    });
});
