import { Telegraf, Context } from 'telegraf';
import { Markup } from 'telegraf';
import { UserModel, User } from './model/user';
import { connectDB } from './config';
const http = require('http');
const bot = new Telegraf('7620733878:AAHjyRdgM6NH-VnWVuPoQlKIyfBTc4ToG14');
const calculateTax = (grossSalary: number) => {
    let taxRate = 0;
    let pension = 0;
    let netSalary = grossSalary;

    if (grossSalary > 600 && grossSalary < 1651) {
        taxRate = grossSalary * 0.1 - 60;
        pension = grossSalary * 0.07;
    } else if (grossSalary > 1650 && grossSalary < 3201) {
        taxRate = grossSalary * 0.15 - 142.5;
        pension = Math.floor(grossSalary * 0.07);
    } else if (grossSalary > 3200 && grossSalary < 5251) {
        taxRate = grossSalary * 0.2 - 302.5;
        pension = grossSalary * 0.07;
    } else if (grossSalary > 5250 && grossSalary < 7801) {
        taxRate = grossSalary * 0.25 - 565;
        pension = grossSalary * 0.07;
    } else if (grossSalary > 7800 && grossSalary < 10901) {
        taxRate = grossSalary * 0.3 - 955;
        pension = grossSalary * 0.07;
    } else if (grossSalary > 10900) {
        taxRate = grossSalary * 0.35 - 1500;
        pension = grossSalary * 0.07;
    }

    netSalary = grossSalary - taxRate - pension;

    return { taxRate, pension, netSalary };
};
function createBar(value: number, maxValue: number, colorBlock: string) {
    const maxBarLength = 8; // Set a max length for the bars
    const barLength = Math.floor((value / maxValue) * maxBarLength);
    return colorBlock.repeat(barLength);
}
const handleTaxRates = async (ctx: Context) => {
    const table = `
    Employment income tax rates (Proclamation <i>no.979/2016</i>)\n
    <b>Income(ETB)</b>       <b>Tax Rate</b>\n
    0 - 600              0%\n
    601 - 1,650         10%\n
    1,651 - 3,200       15%\n
    3,201 - 5,250       20%\n
    5,251 - 7,800       25%\n
    7,801 - 10,900      30%\n
    Over 10,900         35%\n
    Formula
 <pre>
Salary Income Tax = (Gross Salary * Tax Rate) – Deduction

Employee Pension = Gross Salary x 7%

Net Income = Gross Salary – Salary Income Tax – Employee Pension – Other Taxes (If applicable)

Employee Pension = 7%
</pre>
      `;
    ctx.replyWithHTML(table);
};
const handelPenstion = async (ctx: Context) => {
    const table = `
    1,<b>Proclamation no.715/2011 - Private Employee</b>\n
        <i>The contribution is 11% by the employer and 7% by the employees.
    </i>\n
    2,<b>Proclamation no.714/2011 - Public Employee</b>\n
        <i>The contribution is 11% by the public office and 7% by the public servant for public employees.</i>\n
    3,<b>Proclamation no.714/2011 - Military and Police Employee</b>\n
        <i>The contribution is 25% by the public office and 7% by the public servant for public employees-for military and police.</i>\n
     
          `;
    ctx.replyWithHTML(table);
};
async function startBot() {
    await connectDB();

    // Handle the /start command
    bot.start(async (ctx: Context) => {
        const telegramId = ctx.from?.id;
        if (!telegramId) return;
        try {
            const existingUser = await UserModel.findOne({ telegramId });

            // Register new users
            if (!existingUser) {
                const newUser = new UserModel({
                    firstname: ctx.from?.first_name || 'User',
                    username: ctx.from?.username,
                    telegramId,
                });

                await newUser.save(); // Save the new user instance
                console.log("New user registered:", newUser);

                // Send welcome message with a reply keyboard
                await ctx.reply(
                    `Welcome ${newUser.firstname}! Please choose an option below:`,
                    Markup.keyboard([['Tax Rates', 'Pension Contribution']])
                        .resize()

                );

                // Ask for gross salary after welcome message
                await ctx.reply('Please enter your gross salary:');
            } else {
                console.log("User already registered:", existingUser);
                await ctx.reply('Welcome back! Please enter your gross salary:', Markup.keyboard([['Tax Rates', 'Pension Contribution']])
                .resize());
            }
        } catch (error) {
            console.log(error)
        }

    });
    bot.telegram.setMyCommands([
        { command: 'start', description: 'Start The Bot' },
        { command: 'taxrates', description: 'Employment income tax rates' },
        { command: 'penstioncontribution', description: 'Employment Penstion' },

      
        // { command: 'location', description: 'Location' }
      ]);
    bot.command("taxrates", handleTaxRates);

    // Use hears for "Tax Rates"
    bot.hears("Tax Rates", handleTaxRates);

    bot.hears("Pension Contribution", handelPenstion)
    bot.command("penstioncontribution", handelPenstion);
    // Handle gross salary input
    // Handle gross salary input
    bot.on('text', async (ctx: Context) => {
        const telegramId = ctx.from?.id;
        if (!telegramId) return;

        const user = await UserModel.findOne({ telegramId });

        if (user) {
            const salaryInput: any = ctx.text;
            console.log("salaryInput", salaryInput)
            const salary = parseFloat(salaryInput!);

            if (isNaN(salary)) {
                await ctx.reply('Invalid input. Please enter a valid number for your gross salary.');
            } else {
                // Calculate tax and net salary

                const { taxRate, pension, netSalary } = calculateTax(salary);

                // Update user's gross salaries in the database
                user.grossSalaries.push(salary);
                await user.save();

                // await ctx.reply(`Thank you! Your gross salary of ${salary} has been recorded.`);
                const maxValue = Math.max(taxRate, pension, netSalary);

                // Generate bars
                const taxBar = createBar(taxRate, maxValue, "▫️");
                const pensionBar = createBar(pension, maxValue, "▫️");
                const netSalaryBar = createBar(netSalary, maxValue, "▫️");

                // Send the message with the bars
                await ctx.replyWithHTML(`

    Gross Salary: <b>${salaryInput} ETB</b>
      
    Tax Rate: ▫️${taxBar} ${taxRate.toFixed(2)} ETB
    Pension: ▫️${pensionBar} ${pension.toFixed(2)} ETB
    Net Salary:${netSalaryBar} ${netSalary.toFixed(2)} ETB

    
        `)
            }
        } else {
            await ctx.reply('User not found.');
        }
    });


    // Start the bot
    //ethiopian-tax-calculator.vercel.app

    bot.launch();
    // try {


    //     bot.launch({
    //       webhook: {
    //         domain: 'https://ethiopian-tax-calculator.vercel.app/',
    //         hookPath: '/my-secret-path',
    //       },
    //     });
    //     console.log('Bot is running!');
    //     http.createServer(bot.webhookCallback('/my-secret-path')).listen(3000);
      
      
      
    //   } catch (e:any) {
    //     console.error(`Couldn't connect to Telegram - ${e.message}; trying again in 5 seconds...`);
      
    //     // Wait for 5 seconds before attempting to reconnect
    //     new Promise((resolve) => setTimeout(resolve, 5000));
      
      
      
    //   }
    console.log('Bot is running...');
}

startBot().catch(console.error);
