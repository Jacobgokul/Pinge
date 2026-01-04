import { apiClient } from '@/services/api/client';
import { API_ENDPOINTS } from '@/lib/constants';
import type {
  Group,
  GroupMessage,
  GroupMember,
  CreateGroupRequest,
  UpdateGroupRequest,
  SendGroupMessagePayload,
  AddGroupMembersRequest,
} from './types';

/**
 * Groups API service functions
 */
export const groupsService = {
  /**
   * Get all groups user belongs to
   */
  async getGroups(): Promise<Group[]> {
    const response = await apiClient.get<Group[]>(API_ENDPOINTS.GROUPS.LIST);
    return response.data;
  },

  /**
   * Create a new group
   */
  async createGroup(data: CreateGroupRequest): Promise<Group> {
    const response = await apiClient.post<Group>(API_ENDPOINTS.GROUPS.CREATE, data);
    return response.data;
  },

  /**
   * Update group info
   */
  async updateGroup(groupId: string, data: UpdateGroupRequest): Promise<Group> {
    const response = await apiClient.patch<Group>(API_ENDPOINTS.GROUPS.UPDATE(groupId), data);
    return response.data;
  },

  /**
   * Delete a group
   */
  async deleteGroup(groupId: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.GROUPS.DELETE(groupId));
  },

  /**
   * Leave a group
   */
  async leaveGroup(groupId: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.GROUPS.LEAVE(groupId));
  },

  /**
   * Get messages for a group
   */
  async getGroupMessages(groupId: string, limit = 50, offset = 0): Promise<GroupMessage[]> {
    const response = await apiClient.get<GroupMessage[]>(
      `${API_ENDPOINTS.GROUPS.MESSAGES(groupId)}?limit=${limit}&offset=${offset}`
    );
    return response.data;
  },

  /**
   * Send a message to a group
   */
  async sendGroupMessage(groupId: string, payload: SendGroupMessagePayload): Promise<GroupMessage> {
    const response = await apiClient.post<GroupMessage>(
      API_ENDPOINTS.GROUPS.MESSAGES(groupId),
      payload
    );
    return response.data;
  },

  /**
   * Get group members
   */
  async getMembers(groupId: string): Promise<GroupMember[]> {
    const response = await apiClient.get<GroupMember[]>(API_ENDPOINTS.GROUPS.MEMBERS(groupId));
    return response.data;
  },

  /**
   * Add members to a group
   */
  async addMembers(groupId: string, data: AddGroupMembersRequest): Promise<void> {
    await apiClient.post(API_ENDPOINTS.GROUPS.MEMBERS(groupId), data);
  },

  /**
   * Remove a member from a group
   */
  async removeMember(groupId: string, userId: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.GROUPS.REMOVE_MEMBER(groupId, userId));
  },

  /**
   * Change a member's role
   */
  async changeRole(groupId: string, userId: string, role: 'Admin' | 'Member'): Promise<void> {
    await apiClient.patch(API_ENDPOINTS.GROUPS.CHANGE_ROLE(groupId, userId), { user_id: userId, role });
  },
};
