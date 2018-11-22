const ColorUtils = {
  calcLinearPoint: function (startColor, endColor, percent) {
    let start = this.hexToRgbArray(startColor)
    let end = this.hexToRgbArray(endColor)
    let result = "#"
    for (let i = 0; i < start.length; i++) {
      let s = start[i];
      let e = end[i];
      let point;
      if (e >= s) {
        point = s + (e - s) * percent
      } else {
        point = s - (s - e) * percent
      }
      point = parseInt(point)
      result += point.toString(16);
    }
    return result;
  },
  // calcPercent: (startColor, endColor, )

  hexToRgbArray: function (hex) {
    let sColor = hex.toLowerCase();
    //十六进制颜色值的正则表达式
    let reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
    // 如果是16进制颜色
    if (sColor && reg.test(sColor)) {
      if (sColor.length === 4) {
        let sColorNew = "#";
        for (let i = 1; i < 4; i += 1) {
          sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
        }
        sColor = sColorNew;
      }
      //处理六位的颜色值
      let sColorChange = [];
      for (let i = 1; i < 7; i += 2) {
        sColorChange.push(parseInt("0x" + sColor.slice(i, i + 2)));
      }
      return sColorChange;
    }
    return sColor;
  },

  rgbToHex: function (rgb) {
    //十六进制颜色值的正则表达式
    let reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
    // 如果是rgb颜色表示
    if (/^(rgb|RGB)/.test(rgb)) {
      let aColor = rgb.replace(/(?:\(|\)|rgb|RGB)*/g, "").split(",");
      let strHex = "#";
      for (let i = 0; i < aColor.length; i++) {
        let hex = Number(aColor[i]).toString(16);
        if (hex.length < 2) {
          hex = '0' + hex;
        }
        strHex += hex;
      }
      if (strHex.length !== 7) {
        strHex = rgb;
      }
      return strHex;
    } else if (reg.test(rgb)) {
      let aNum = rgb.replace(/#/, "").split("");
      if (aNum.length === 6) {
        return rgb;
      } else if (aNum.length === 3) {
        let numHex = "#";
        for (let i = 0; i < aNum.length; i += 1) {
          numHex += (aNum[i] + aNum[i]);
        }
        return numHex;
      }
    }
    return rgb;
  }

}

export default ColorUtils
