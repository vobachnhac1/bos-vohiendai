import { Injectable } from '@nestjs/common';
import { CommonsService } from './commons.service';

@Injectable()
export class CommonsLookupService {
  constructor(private readonly commonsService: CommonsService) {}

  /**
   * Get vessel type description by AIS vessel type code
   */
  async getVesselTypeDescription(vesselTypeCode: string | number): Promise<string> {
    const code = String(vesselTypeCode);
    const common = await this.commonsService.findByTypeAndKey('vessel_type', code);
    return common?.value || 'Unknown vessel type';
  }

  /**
   * Get navigation status description by nav status code
   */
  async getNavStatusDescription(navStatusCode: string | number): Promise<string> {
    const code = String(navStatusCode);
    const common = await this.commonsService.findByTypeAndKey('nav_status', code);
    return common?.value || 'Unknown navigation status';
  }

  /**
   * Get AIS message type description by message type code
   */
  async getAisMessageTypeDescription(messageTypeCode: string | number): Promise<string> {
    const code = String(messageTypeCode);
    const common = await this.commonsService.findByTypeAndKey('ais_message_type', code);
    return common?.value || 'Unknown message type';
  }

  /**
   * Get all vessel types as key-value pairs
   */
  async getVesselTypes(): Promise<{ [key: string]: string }> {
    const commons = await this.commonsService.findByType('vessel_type');
    const result: { [key: string]: string } = {};
    commons.forEach(common => {
      result[common.key] = common.value || common.key;
    });
    return result;
  }

  /**
   * Get all navigation statuses as key-value pairs
   */
  async getNavStatuses(): Promise<{ [key: string]: string }> {
    const commons = await this.commonsService.findByType('nav_status');
    const result: { [key: string]: string } = {};
    commons.forEach(common => {
      result[common.key] = common.value || common.key;
    });
    return result;
  }

  /**
   * Get all AIS message types as key-value pairs
   */
  async getAisMessageTypes(): Promise<{ [key: string]: string }> {
    const commons = await this.commonsService.findByType('ais_message_type');
    const result: { [key: string]: string } = {};
    commons.forEach(common => {
      result[common.key] = common.value || common.key;
    });
    return result;
  }

  /**
   * Get configuration value by type and key
   */
  async getConfigValue(type: string, key: string, defaultValue?: string): Promise<string | null> {
    const common = await this.commonsService.findByTypeAndKey(type, key);
    return common?.value || defaultValue || null;
  }

  /**
   * Check if a configuration exists and is active
   */
  async isConfigActive(type: string, key: string): Promise<boolean> {
    const common = await this.commonsService.findByTypeAndKey(type, key);
    return common?.status === true;
  }
}
