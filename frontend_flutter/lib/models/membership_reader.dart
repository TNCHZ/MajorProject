import 'package:mobile_app/models/type_membership.dart';

class MembershipReader {
  final int id;
  final DateTime startDate;
  final DateTime expireDate;
  final DateTime createdAt;
  final TypeMembership type;

  MembershipReader({
    required this.id,
    required this.startDate,
    required this.expireDate,
    required this.createdAt,
    required this.type,
  });

  factory MembershipReader.fromJson(Map<String, dynamic> json) {
    return MembershipReader(
      id: json['id'],
      startDate: DateTime.parse(json['startDate']),
      expireDate: DateTime.parse(json['expireDate']),
      createdAt: DateTime.parse(json['createdAt']),
      type: TypeMembership.fromJson(json['type']),
    );
  }
}
