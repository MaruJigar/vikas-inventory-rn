import AsyncStorage from '@react-native-async-storage/async-storage';

const QUEUE_KEY = '@vikas_offline_queue';

class OfflineQueueService {
  static async getQueue() {
    try {
      const data = await AsyncStorage.getItem(QUEUE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading offline queue', e);
      return [];
    }
  }

  static async enqueueOrder(orderPayload) {
    try {
      const queue = await this.getQueue();
      const newOrder = {
        id: `local_${Date.now()}`,
        timestamp: new Date().toISOString(),
        payload: orderPayload,
        status: 'pending' // pending, failed, synced
      };
      
      queue.push(newOrder);
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
      return newOrder;
    } catch (e) {
      console.error('Error enqueueing order', e);
      throw e;
    }
  }

  static async removeOrder(localId) {
    try {
      let queue = await this.getQueue();
      queue = queue.filter(item => item.id !== localId);
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    } catch (e) {
      console.error('Error removing order from queue', e);
    }
  }

  static async markOrderFailed(localId, errorMessage) {
    try {
      let queue = await this.getQueue();
      const index = queue.findIndex(item => item.id === localId);
      if (index !== -1) {
        queue[index].status = 'failed';
        queue[index].error = errorMessage;
        await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
      }
    } catch (e) {
      console.error('Error marking order failed', e);
    }
  }

  static async clearQueue() {
    try {
      await AsyncStorage.removeItem(QUEUE_KEY);
    } catch (e) {
      console.error('Error clearing queue', e);
    }
  }
}

export default OfflineQueueService;
