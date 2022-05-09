export class DateUtil {
  constructor(public date: Date = new Date()) {}

  static subtractMonths(numOfMonths: number, date: Date = new Date()): Date {
    const clonedDate = new Date(date);

    clonedDate.setMonth(clonedDate.getMonth() - numOfMonths);

    return clonedDate;
  }

  subtractMonths(numOfMonths: number): Date {
    return DateUtil.subtractMonths(numOfMonths, this.date);
  }
}
