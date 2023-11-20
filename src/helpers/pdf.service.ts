import {Injectable} from "@nestjs/common";
import * as ejs from "ejs";
import {join} from "path";
import {RubleHelperService} from "./ruble.service";
import {CustomerToSystemSettings, Settings} from "@prisma/client";
// @ts-ignore
import * as puppeteer from "puppeteer";
import {readFileSync} from "fs";
import {TengeHelperService} from "./tenge.service";
import {IBillAcceptor} from "../common/types/PdfGenerator";

@Injectable()
export class PdfService {
  constructor(private rubleService: RubleHelperService, private tengeService: TengeHelperService) {
  }

  generateBill({
                 bill,
                 contacts,
                 sign,
                 customer,
                 contract,
                 settings,
                 regionName
               }: IBillAcceptor): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const settingsVat = settings.vat || 0;
        const sum = bill.lines.reduce((acc, line) => acc + line.sum, 0);
        const lines = bill.lines.map((line) => {
          const totalVat = line.sum * (settingsVat / 100);
          let lineType = 'контекстной'
          if (['VK', 'Facebook', 'MyTarget', 'TikTok'].includes(line.system)) lineType = 'таргетированной'

          return {
            ...line,
            totalVat,
            type: lineType,
            vat: settingsVat,
            total: line.sum + totalVat,
          };
        });
        const total = lines.reduce((acc, line) => acc + line.total, 0);
        const vat = lines.reduce((acc, line) => acc + line.totalVat, 0);
        let templateName = regionName === 'KZ' ? 'bill.kz.ejs' : 'bill.ejs'
        let vatString = regionName === 'KZ' ? this.tengeService.stringTenge(vat) :
            this.rubleService.stringRubles(vat)
        let totalString = regionName === 'KZ' ? this.tengeService.stringTenge(total) :
            this.rubleService.stringRubles(total)

        const image = readFileSync(
            join(process.cwd(), "documents", "sign", sign).replace(/\\/g, "/"),
            {
              encoding: "base64",
            }
        );

        const template = await ejs.renderFile(
            join(__dirname, "templates", templateName),
            {
              bill,
              contacts,
              customer,
              contract,
              image,
              lines,
              settingsVat,
              total: {
                total,
                vat,
                sum,
                totalString,
                vatString,
              },
              today: new Date().toLocaleDateString("ru-RU", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }),
            }
        );

        const filename = `${bill.number.replace("/", "-")}.pdf`;
        const pdfPath = join(process.cwd(), "documents", "bills", filename);
        const pdfOptions = {

          path: pdfPath,
        };
        const browser = await puppeteer.launch({
          args: ['--no-sandbox'],
          headless: true,
        });
        let page = await browser.newPage();
        await page.setViewport({
          deviceScaleFactor: 1,
          width: 595,
          height: 842,
        })
        await page.goto(`data:text/html;charset=UTF-8,${template}`, {
          waitUntil: "networkidle2",
        });
        await page.setContent(template);
        // @ts-ignore
        await page.pdf(pdfOptions);
        await browser.close();
        resolve(filename);
      } catch (err) {
        console.error(err)
        reject(err)
      }
    });
  }

  async generateClosureDocument({
    bill,
    contacts,
    sign,
    customer,
    contract,
                                  regionName
  }): Promise<{ link: string; sum: number; total: number }> {
    return new Promise(async (resolve, reject) => {
      const systemSettings =
        contract.systemSettings as CustomerToSystemSettings[];
      const settings = contract.settings as Settings;

      const settingsVat = settings.vat;
      const sum = bill.lines.reduce((acc, line) => acc + line.sum, 0);
      console.log(contacts);
      console.log(systemSettings);

      const image = readFileSync(
        join(process.cwd(), "documents", "sign", sign).replace(/\\/g, "/"),
        {
          encoding: "base64",
        }
      );

      const lines = bill.lines.map((line) => {
        const system = systemSettings.find(
            (s) => s.systemName === line.account.system.name
        );
        console.log(system, 'LINE', line);
        const totalVat = line.sum * (settingsVat / 100);
        let lineType = 'контекстной'
        if (['VK', 'Facebook', 'MyTarget', 'TikTok'].includes(line.account.system.name)) lineType = 'таргетированной'

        return {
          ...line,
          totalVat,
          type: lineType,
          name: line.account.system.name,
          vat: settingsVat,
          total: parseFloat(line.sum) + Number(totalVat),
        };
      });
      const total = lines.reduce((acc, line) => acc + line.total, 0);
      const vat = lines.reduce((acc, line) => acc + line.totalVat, 0);
      let vatString = regionName === 'KZ' ? this.tengeService.stringTenge(vat) :
          this.rubleService.stringRubles(vat)
      let totalString = regionName === 'KZ' ? this.tengeService.stringTenge(total) :
          this.rubleService.stringRubles(total)
      let templateName = regionName === 'KZ' ? 'closure.kz.ejs' : 'closure.ejs'

      const template = await ejs.renderFile(
          join(__dirname, "templates", templateName),
          {
            bill,
            contacts,
            customer,
            contract,
            lines,
            image,
            settingsVat,
            total: {
              total,
              vat,
              sum,
              totalString,
              vatString,
            },
          today: new Date().toLocaleDateString("ru-RU", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
        }
      );

      const filename = `${bill.number.replace("/", "-")}.pdf`;
      const pdfPath = join(process.cwd(), "documents", "acts", filename);
      const pdfOptions = {
        width: "595px",
        height: "842px",
        displayHeaderFooter: false,
        format: 'A4',
        path: pdfPath,
        margin: {
          top: "10px",
          bottom: "10px",
          left: "30px",
          right: "10px",
        },
      };
      const browser = await puppeteer.launch({
        args: ["--no-sandbox"],
        headless: true,
      });
      var page = await browser.newPage();
      await page.goto(`data:text/html;charset=UTF-8,${template}`, {
        waitUntil: "networkidle0",
      });
      await page.setContent(template);
      // @ts-ignore
      await page.pdf(pdfOptions);
      await browser.close();
      resolve({
        link: filename,
        total: parseFloat(total),
        sum: total - vat,
      });
    });
  }
}
