import { Member, Transaction, Match } from './types';

export const mockMembers: Member[] = [
  { id: 'm1', name: 'Nguyễn Văn A', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix', position: 'Tiền đạo', joinDate: '2023-01-15', status: 'active' },
  { id: 'm2', name: 'Trần Văn B', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka', position: 'Tiền vệ', joinDate: '2023-02-10', status: 'active' },
  { id: 'm3', name: 'Lê Văn C', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver', position: 'Hậu vệ', joinDate: '2023-01-20', status: 'active' },
  { id: 'm4', name: 'Phạm Văn D', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack', position: 'Thủ môn', joinDate: '2023-03-05', status: 'active' },
  { id: 'm5', name: 'Hoàng Văn E', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Leo', position: 'Tiền vệ', joinDate: '2023-04-12', status: 'active' },
];

export const mockMatches: Match[] = [
  { id: 'match1', date: '2023-10-10', opponent: 'FC Thanh Xuân', location: 'Sân cỏ nhân tạo Mỹ Đình', result: 'win', score: '3-1' },
  { id: 'match2', date: '2023-10-17', opponent: 'FC Cầu Giấy', location: 'Sân bóng Thủy Lợi', result: 'draw', score: '2-2' },
  { id: 'match3', date: '2023-10-24', opponent: 'FC Đống Đa', location: 'Sân bóng Chùa Láng', result: 'loss', score: '0-1' },
  { id: 'match4', date: '2023-10-31', opponent: 'FC Hà Đông', location: 'Sân bóng Đại học Hà Nội', result: 'upcoming' },
];

export const mockTransactions: Transaction[] = [
  { id: 't1', type: 'income', amount: 500000, date: '2023-10-01', description: 'Đóng quỹ tháng 10', memberId: 'm1', },
  { id: 't2', type: 'income', amount: 500000, date: '2023-10-02', description: 'Đóng quỹ tháng 10', memberId: 'm2', },
  { id: 't3', type: 'expense', amount: 800000, date: '2023-10-10', description: 'Tiền sân trận Thanh Xuân', matchId: 'match1', },
  { id: 't4', type: 'expense', amount: 150000, date: '2023-10-10', description: 'Tiền nước trận Thanh Xuân', matchId: 'match1', },
  { id: 't5', type: 'income', amount: 500000, date: '2023-10-15', description: 'Đóng quỹ tháng 10', memberId: 'm3', },
  { id: 't6', type: 'expense', amount: 800000, date: '2023-10-17', description: 'Tiền sân trận Cầu Giấy', matchId: 'match2', },
  { id: 't7', type: 'expense', amount: 100000, date: '2023-10-17', description: 'Tiền nước', matchId: 'match2', },
  { id: 't8', type: 'income', amount: 500000, date: '2023-10-20', description: 'Đóng quỹ tháng 10', memberId: 'm4', },
  { id: 't9', type: 'income', amount: 500000, date: '2023-10-21', description: 'Đóng quỹ tháng 10', memberId: 'm5', },
  { id: 't10', type: 'expense', amount: 800000, date: '2023-10-24', description: 'Tiền sân trận Đống Đa', matchId: 'match3', },
  { id: 't11', type: 'expense', amount: 120000, date: '2023-10-24', description: 'Tiền nước', matchId: 'match3', },
];
