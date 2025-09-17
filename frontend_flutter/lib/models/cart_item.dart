class CartItem {
  final int bookId;
  final String title;
  final String image;
  int quantity;

  CartItem({
    required this.bookId,
    required this.title,
    required this.image,
    this.quantity = 1,
  });
}
