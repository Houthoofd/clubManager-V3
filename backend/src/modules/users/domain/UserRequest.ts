export interface UserRequestRow {
  id: number;
  user_id: number;
  user_name?: string;
  type: 'account_deletion' | 'other';
  message: string | null;
  status: 'pending' | 'approved' | 'rejected';
  admin_comment: string | null;
  created_at: Date;
  updated_at: Date;
}

export class UserRequest {
  constructor(
    public readonly id: number,
    public readonly user_id: number,
    public readonly type: 'account_deletion' | 'other',
    public readonly message: string | null,
    public readonly status: 'pending' | 'approved' | 'rejected',
    public readonly admin_comment: string | null,
    public readonly created_at: Date,
    public readonly updated_at: Date,
    public readonly user_name?: string
  ) {}

  static fromRow(row: UserRequestRow): UserRequest {
    return new UserRequest(
      row.id,
      row.user_id,
      row.type,
      row.message,
      row.status,
      row.admin_comment,
      row.created_at,
      row.updated_at,
      row.user_name
    );
  }
}
