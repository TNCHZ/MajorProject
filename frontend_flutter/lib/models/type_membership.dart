class TypeMembership {
  final int id;
  final String title;
  final double price;
  final int duration;
  final String description;
  final bool canReadEbook;

  TypeMembership({
    required this.id,
    required this.title,
    required this.price,
    required this.duration,
    required this.description,
    required this.canReadEbook,
  });

  factory TypeMembership.fromJson(Map<String, dynamic> json) {
    return TypeMembership(
      id: json['id'],
      title: json['title'],
      price: json['price'].toDouble(),
      duration: json['duration'],
      description: json['description'],
      canReadEbook: json['canReadEbook'],
    );
  }
}