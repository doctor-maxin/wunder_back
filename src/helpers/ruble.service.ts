import { Injectable } from "@nestjs/common";

const words = [
    [
        "",
        "один",
        "два",
        "три",
        "четыре",
        "пять",
        "шесть",
        "семь",
        "восемь",
        "девять",
        "десять",
        "одиннадцать",
        "двенадцать",
        "тринадцать",
        "четырнадцать",
        "пятнадцать",
        "шестнадцать",
        "семнадцать",
        "восемнадцать",
        "девятнадцать",
    ],
    [
        "",
        "",
        "двадцать",
        "тридцать",
        "сорок",
        "пятьдесят",
        "шестьдесят",
        "семьдесят",
        "восемьдесят",
        "девяносто",
    ],
    [
        "",
        "сто",
        "двести",
        "триста",
        "четыреста",
        "пятьсот",
        "шестьсот",
        "семьсот",
        "восемьсот",
        "девятьсот",
    ],
];

@Injectable()
export class RubleHelperService {
    stringRubles(val: number) {
        let type = typeof val;

        if (val <= 0) {
            return false;
        }

        let splt;
        let decimals;

        let number = val.toFixed(2);
        if (number.indexOf(".") !== -1) {
            splt = number.split(".");
            number = splt[0];
            decimals = splt[1];
        }

        let numeral = "";
        let length = number.length - 1;
        let parts = "";
        let count = 0;
        let digit;

        while (length >= 0) {
            digit = number.substr(length, 1);
            parts = digit + parts;

            if (
                (parts.length === 3 || length === 0) &&
                !isNaN(this.toFloat(parts))
            ) {
                numeral = this.parseNumber(parts, count) + numeral;
                parts = "";
                count++;
            }

            length--;
        }

        numeral = numeral.replace(/\s+/g, " ");

        if (decimals) {
            numeral = numeral + this.parseDecimals(this.toFloat(decimals));
        }

        return numeral;
    }
    parseDecimals = (number) => {
        let text = this.plural(number, ["копейка", "копейки", "копеек"]);

        if (number === 0) {
            number = "00";
        } else if (number < 10) {
            number = "0" + number;
        }

        return " " + number + " " + text;
    };
    parseNumber(number, count) {
        let first;
        let second;
        let numeral = "";

        if (number.length === 3) {
            first = number.substr(0, 1);
            number = number.substr(1, 3);
            numeral = "" + words[2][first] + " ";
        }

        if (number < 20) {
            numeral = numeral + words[0][this.toFloat(number)] + " ";
        } else {
            first = number.substr(0, 1);
            second = number.substr(1, 2);
            numeral = numeral + words[1][first] + " " + words[0][second] + " ";
        }

        if (count === 0) {
            numeral =
                numeral +
                this.plural(number, [
                    "белорусский рубль",
                    "белорусских рубля",
                    "белорусских рублей",
                ]);
        } else if (count === 1) {
            if (numeral !== "  ") {
                numeral =
                    numeral +
                    this.plural(number, ["тысяча ", "тысячи ", "тысяч "]);
                numeral = numeral
                    .replace("один ", "одна ")
                    .replace("два ", "две ");
            }
        } else if (count === 2) {
            if (numeral !== "  ") {
                numeral =
                    numeral +
                    this.plural(number, [
                        "миллион ",
                        "миллиона ",
                        "миллионов ",
                    ]);
            }
        } else if (count === 3) {
            numeral =
                numeral +
                this.plural(number, ["миллиард ", "миллиарда ", "миллиардов "]);
        }

        return numeral;
    }
    plural(count, options) {
        if (options.length !== 3) {
            return false;
        }
        count = Math.abs(count) % 100;
        let rest = count % 10;

        if (count > 10 && count < 20) {
            return options[2];
        }

        if (rest > 1 && rest < 5) {
            return options[1];
        }

        if (rest === 1) {
            return options[0];
        }

        return options[2];
    }
    toFloat(number) {
        return parseFloat(number);
    }
}
