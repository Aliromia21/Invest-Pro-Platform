
import { apiService } from './api.service';
import { API_ENDPOINTS } from '../config/api.config';
import type { Message, PaginatedResponse } from '../types/api';

class MessageService {
  async getMessages(page: number = 1): Promise<PaginatedResponse<Message>> {
    return apiService.get<PaginatedResponse<Message>>(
      `${API_ENDPOINTS.MESSAGES}?page=${page}`
    );
  }

  async sendMessage(
    recipientId: number,
    subject: string,
    message: string,
    offerDetails?: {
      platform: 'facebook' | 'instagram' | 'youtube';
    }
  ): Promise<Message> {
    return apiService.post<Message>(API_ENDPOINTS.SEND_MESSAGE, {
      recipient: recipientId,
      subject,
      message,
      offer_details: offerDetails,
    });
  }

  async markAsRead(messageId: number): Promise<void> {
    await apiService.post(`${API_ENDPOINTS.MARK_READ}${messageId}/`);
  }

  async submitOfferLink(
    messageId: number,
    link: string
  ): Promise<Message> {
    return apiService.post<Message>(
      `${API_ENDPOINTS.SUBMIT_OFFER_LINK}${messageId}/`,
      { link }
    );
  }
}

export const messageService = new MessageService();
