/**
 * @fileoverview Unit tests for renewal email service
 * @version 1.0.0
 * @author EXACTUM-dev
 * @description Tests for the membership renewal notification system
 */

import { jest } from '@jest/globals';

// Mock dependencies
const mockGetExpiringMemberships = jest.fn();
const mockExistsNotificationToday = jest.fn();
const mockCreateNotification = jest.fn();
const mockDecryptFields = jest.fn();
const mockCreatePaymentPreference = jest.fn();
const mockSendRenewalReminder = jest.fn();
const mockCalculatePriority = jest.fn();
const mockBuildNotificationMessage = jest.fn();

// Mock NotificationController
jest.unstable_mockModule('../../src/controllers/notifications.controller.js', () => ({
    default: {
        calculatePriority: mockCalculatePriority,
        buildNotificationMessage: mockBuildNotificationMessage,
    },
}));

// Mock models
jest.unstable_mockModule('../../src/models/membershipApplication.model.js', () => ({
    getExpiringMemberships: mockGetExpiringMemberships,
}));

jest.unstable_mockModule('../../src/models/notifications.model.js', () => ({
    existsNotificationToday: mockExistsNotificationToday,
    create: mockCreateNotification,
}));

// Mock services
jest.unstable_mockModule('../../src/services/encryptionService.js', () => ({
    decryptFields: mockDecryptFields,
}));

jest.unstable_mockModule('../../src/services/payment.service.js', () => ({
    default: {
        createPaymentPreference: mockCreatePaymentPreference,
    },
}));

jest.unstable_mockModule('../../src/services/emailServices.js', () => ({
    sendRenewalReminder: mockSendRenewalReminder,
}));

// Import the service after mocking
const { checkExpiringMemberships } = await import('../../../src/services/notificationCronJob.js');

describe('Renewal Email Service Tests', () => {
    let consoleLogSpy;
    let consoleErrorSpy;

    beforeEach(() => {
        jest.clearAllMocks();
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
        consoleLogSpy.mockRestore();
        consoleErrorSpy.mockRestore();
    });

    describe('Happy Path', () => {
        test('should process memberships and send emails successfully', async () => {
            // Arrange
            const mockMemberships = [{
                IDUsuario: 1,
                clerk_user_id: 'user_123',
                IDMembresia: 101,
                daysRemaining: 7,
                fechaVencimiento: '2025-12-05',
                tipo: 'Estudiante',
                nombres: 'encrypted_juan',
                apellidoP: 'encrypted_perez',
                correo: 'encrypted_juan@example.com',
            }];

            mockGetExpiringMemberships.mockResolvedValue(mockMemberships);
            mockExistsNotificationToday.mockResolvedValue(false);
            mockCalculatePriority.mockReturnValue('medium');
            mockBuildNotificationMessage.mockReturnValue({
                message: 'Te quedan 7 días para renovar tu membresía',
                details: 'Tu membresía vence el día 05 de diciembre de 2025',
                subtext: 'Recuerda que puedes renovarla desde "Mi perfil"',
            });
            mockCreateNotification.mockResolvedValue({ success: true, notificationID: 1 });
            mockDecryptFields.mockReturnValue({
                nombres: 'Juan',
                apellidoP: 'Pérez',
                correo: 'juan@example.com',
            });
            mockCreatePaymentPreference.mockResolvedValue({
                id: 'pref_123',
                init_point: 'https://mercadopago.com/checkout/pref_123',
            });
            mockSendRenewalReminder.mockResolvedValue({
                success: true,
                messageId: 'msg_123',
            });

            // Act
            await checkExpiringMemberships();

            // Assert
            expect(mockGetExpiringMemberships).toHaveBeenCalled();
            expect(mockExistsNotificationToday).toHaveBeenCalledWith(1, 7);
            expect(mockCalculatePriority).toHaveBeenCalledWith(7);
            expect(mockBuildNotificationMessage).toHaveBeenCalledWith(7, '2025-12-05');
            expect(mockCreateNotification).toHaveBeenCalled();
            expect(mockDecryptFields).toHaveBeenCalled();
            expect(mockCreatePaymentPreference).toHaveBeenCalledWith({
                membershipId: 101,
                membershipType: 'Estudiante',
                amount: 900,
                userEmail: 'juan@example.com',
            });
            expect(mockSendRenewalReminder).toHaveBeenCalledWith(
                'juan@example.com',
                'Juan Pérez',
                expect.any(String),
                7,
                'https://mercadopago.com/checkout/pref_123'
            );
        });
    });

    describe('Edge Cases', () => {
        test('should handle no expiring memberships', async () => {
            mockGetExpiringMemberships.mockResolvedValue([]);

            await checkExpiringMemberships();

            expect(mockGetExpiringMemberships).toHaveBeenCalled();
            expect(mockCreateNotification).not.toHaveBeenCalled();
        });

        test('should skip existing notifications', async () => {
            const mockMemberships = [{
                IDUsuario: 1,
                clerk_user_id: 'user_123',
                IDMembresia: 101,
                daysRemaining: 7,
                fechaVencimiento: '2025-12-05',
                tipo: 'Estudiante',
            }];

            mockGetExpiringMemberships.mockResolvedValue(mockMemberships);
            mockExistsNotificationToday.mockResolvedValue(true);

            await checkExpiringMemberships();

            expect(mockExistsNotificationToday).toHaveBeenCalledWith(1, 7);
            expect(mockCreateNotification).not.toHaveBeenCalled();
        });

        test('should continue if payment link fails', async () => {
            const mockMemberships = [{
                IDUsuario: 1,
                clerk_user_id: 'user_123',
                IDMembresia: 101,
                daysRemaining: 7,
                fechaVencimiento: '2025-12-05',
                tipo: 'Estudiante',
                nombres: 'encrypted_juan',
                apellidoP: 'encrypted_perez',
                correo: 'encrypted_juan@example.com',
            }];

            mockGetExpiringMemberships.mockResolvedValue(mockMemberships);
            mockExistsNotificationToday.mockResolvedValue(false);
            mockCalculatePriority.mockReturnValue('medium');
            mockBuildNotificationMessage.mockReturnValue({
                message: 'Test message',
                details: 'Test details',
                subtext: 'Test subtext',
            });
            mockCreateNotification.mockResolvedValue({ success: true });
            mockDecryptFields.mockReturnValue({
                nombres: 'Juan',
                apellidoP: 'Pérez',
                correo: 'juan@example.com',
            });
            mockCreatePaymentPreference.mockRejectedValue(new Error('Payment error'));
            mockSendRenewalReminder.mockResolvedValue({ success: true });

            await checkExpiringMemberships();

            expect(mockSendRenewalReminder).toHaveBeenCalledWith(
                'juan@example.com',
                'Juan Pérez',
                expect.any(String),
                7,
                '' // Empty link when payment fails
            );
        });
    });

    describe('Error Handling', () => {
        test('should handle database errors', async () => {
            mockGetExpiringMemberships.mockRejectedValue(new Error('DB error'));

            await checkExpiringMemberships();

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Error en el Job de notificaciones:',
                expect.any(Error)
            );
        });
    });
});
