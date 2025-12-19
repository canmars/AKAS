/**
 * Bildirim Model
 * Bildirim iş mantığı ve validasyon
 */

export class BildirimModel {
  static validate(data) {
    const errors = [];

    if (!data.mesaj) {
      errors.push('Mesaj zorunludur');
    }

    if (!data.bildirim_onceligi) {
      errors.push('Bildirim önceliği zorunludur');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

