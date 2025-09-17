package com.tnc.library.enums;

import java.math.BigDecimal;

public enum TypeFineEnum {
    LOST {
        @Override
        public BigDecimal calculateFineAmount(BigDecimal bookPrice, int duration) {
            return bookPrice;
        }
    },
    OVERDUE_AND_RETURNED {
        @Override
        public BigDecimal calculateFineAmount(BigDecimal bookPrice, int duration) {
            return BigDecimal.valueOf(duration* 2000L);
        }
    },
    DAMAGED {
        @Override
        public BigDecimal calculateFineAmount(BigDecimal bookPrice, int duration) {
            return bookPrice.divide(BigDecimal.valueOf(2));
        }
    },
    OVERDUE_AND_DAMAGED {
        @Override
        public BigDecimal calculateFineAmount(BigDecimal bookPrice, int duration) {
            return BigDecimal.valueOf(duration* 2000L).add(bookPrice.divide(BigDecimal.valueOf(2)));
        }
    },
    OVERDUE_AND_LOST {
        @Override
        public BigDecimal calculateFineAmount(BigDecimal bookPrice, int duration) {
            return BigDecimal.valueOf(duration* 2000L).add(bookPrice);
        }
    };

    public abstract BigDecimal calculateFineAmount(BigDecimal bookPrice, int duration);
}
