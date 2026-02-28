import { apiService } from './api.service';
import { API_ENDPOINTS } from '../config/api.config';
import type { KYCVerification } from '../types/api';

export interface KYCSubmitData {
  full_name: string;
  date_of_birth: string;
  country: string;
  id_type: string;
  id_number: string;
  id_front_image: File;
  id_back_image?: File;
  selfie_image: File;
}

class KYCService {
  async submitKYC(data: KYCSubmitData): Promise<KYCVerification> {
    const formData = new FormData();
    formData.append('full_name', data.full_name);
    formData.append('date_of_birth', data.date_of_birth);
    formData.append('country', data.country);
    formData.append('id_type', data.id_type);
    formData.append('id_number', data.id_number);
    formData.append('id_front_image', data.id_front_image);
    if (data.id_back_image) {
      formData.append('id_back_image', data.id_back_image);
    }
    formData.append('selfie_image', data.selfie_image);

    return apiService.uploadFile<KYCVerification>(
      API_ENDPOINTS.SUBMIT_KYC,
      formData
    );
  }

  async getKYCStatus(): Promise<KYCVerification> {
    return apiService.get<KYCVerification>(API_ENDPOINTS.KYC_STATUS);
  }
}

export const kycService = new KYCService();
