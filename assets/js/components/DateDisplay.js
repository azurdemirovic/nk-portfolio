/**
 * Web component so we can easily reuse an updating date string
 */
class DateDisplay extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.render();
    this.updateTimeString();
    setInterval(() => this.updateTimeString(), 10000); // Update the string every 10s
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline;
        }

        span {
          font: inherit;
        }
      </style>
      <span id="date-output"></span>
    `;
  }

  updateTimeString() {
    const today = new Date();
    const day = today.getDay();
    const month = today.getMonth();
    const date = new String(today.getDate()).padStart(2, "0");
    const year = today.getFullYear();
    const hour = today.getHours();
    const min = today.getMinutes();
    const dayString = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const monthString = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const hourString = [
      "12",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "11",
      "12",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "11",
    ];
    let timeLine = "";

    if (min < 10 && hour < 12) {
      timeLine = `It’s ${dayString[day]}, ${monthString[month]} ${date}, ${year}, ${hourString[hour]}:0${min}&nbsp;am, `;
    } else if (min > 9 && hour < 12) {
      timeLine = `It’s ${dayString[day]}, ${monthString[month]} ${date}, ${year}, ${hourString[hour]}:${min}&nbsp;am, `;
    } else if (min < 10 && hour > 11) {
      timeLine = `It’s ${dayString[day]}, ${monthString[month]} ${date}, ${year}, ${hourString[hour]}:0${min}&nbsp;pm, `;
    } else if (min > 9 && hour > 11) {
      timeLine = `It’s ${dayString[day]}, ${monthString[month]} ${date}, ${year}, ${hourString[hour]}:${min}&nbsp;pm, `;
    }

    this.shadowRoot.querySelector("#date-output").innerHTML = timeLine;
  }
}

customElements.define("date-display", DateDisplay);
