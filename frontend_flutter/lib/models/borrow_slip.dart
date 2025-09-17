class BorrowSlip {
  final int id;
  final DateTime borrowDate;
  final DateTime dueDate;
  final DateTime? returnDate;
  final String status;
  final String? note;

  BorrowSlip({
    required this.id,
    required this.borrowDate,
    required this.dueDate,
    this.returnDate,
    required this.status,
    this.note,
  });

  factory BorrowSlip.fromJson(Map<String, dynamic> json) {
    return BorrowSlip(
      id: json['id'],
      borrowDate: DateTime.parse(json['borrowDate']),
      dueDate: DateTime.parse(json['dueDate']),
      returnDate: json['returnDate'] != null ? DateTime.parse(json['returnDate']) : null,
      status: json['status'],
      note: json['note'],
    );
  }
}