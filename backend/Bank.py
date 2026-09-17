import re
import random


class BANK:

    Holder_details = []

    def create_Account(self):
        new_holder = {}

        new_holder['Holder_name'] = input('Enter Holder name: ')

        Mobile = input('Enter Mobile number: ')

        c = re.fullmatch("[6-9][0-9]{9}", Mobile)

        if c:
            new_holder['mobile'] = Mobile
            new_holder['Aadhar'] = int(input('Enter Aadhar Number: '))
            new_holder['IFSC'] = 'SBI0123'
            new_holder['Account_num'] = random.randint(
                1000000000, 9999999999
            )

            n = input(
                'Select your type of Account (saving/zero): '
            ).lower()

            while True:

                if n == 'saving':

                    amount = int(
                        input(
                            'Saving account requires minimum 1000. '
                            'Enter amount: '
                        )
                    )

                    if amount >= 1000:
                        new_holder['Balance'] = amount
                        break
                    else:
                        print('---- Deposit minimum 1000 ----')

                elif n == 'zero':

                    amount = int(
                        input(
                            'Zero account requires minimum 500. '
                            'Enter amount: '
                        )
                    )

                    if amount >= 500:
                        new_holder['Balance'] = amount
                        break
                    else:
                        print('---- Deposit minimum 500 ----')

                else:
                    print('Invalid account type')
                    n = input(
                        'Enter saving or zero: '
                    ).lower()

            BANK.Holder_details.append(new_holder)

            print('\nAccount created successfully!')
            print('Your Account Number:', new_holder['Account_num'])

        else:
            print('---- Invalid Mobile Number ----')

    def Deposit(self):

        print('---- Deposit Amount ----')

        acc_num = int(input('Enter your Account number: '))

        found = False

        for i in BANK.Holder_details:

            if i['Account_num'] == acc_num:

                found = True

                print('Your Current Balance:', i['Balance'])

                amount = int(input('Enter Amount to Deposit: '))

                if amount > 0:
                    i['Balance'] += amount

                    print('Your Updated Balance:', i['Balance'])
                else:
                    print('---- Invalid Amount ----')

                break

        if not found:
            print('---- Invalid Account Number ----')

    def Withdraw(self):

        print('---- Withdraw Amount ----')

        acc_num = int(input('Enter your Account number: '))

        found = False

        for i in BANK.Holder_details:

            if i['Account_num'] == acc_num:

                found = True

                print('Your Current Balance:', i['Balance'])

                amount = int(
                    input('Enter Amount to Withdraw: ')
                )

                if amount <= i['Balance'] and amount > 0:

                    i['Balance'] -= amount

                    print(
                        'Your Updated Balance:',
                        i['Balance']
                    )

                else:
                    print('---- Insufficient Balance / Invalid Amount ----')

                break

        if not found:
            print('---- Invalid Account Number ----')

    def check_balance(self):

        print('---- Check Balance ----')

        acc_num = int(input('Enter your Account number: '))

        found = False

        for i in BANK.Holder_details:

            if i['Account_num'] == acc_num:

                found = True

                print(
                    'Your Current Balance:',
                    i['Balance']
                )

                break

        if not found:
            print('---- Invalid Account Number ----')

    def display_details(self):

        print('---- Display Account Details ----')

        acc_num = int(input('Enter your Account number: '))

        found = False

        for i in BANK.Holder_details:

            if i['Account_num'] == acc_num:

                found = True

                print('\nHolder Name:', i['Holder_name'])
                print('Mobile Number:', i['mobile'])
                print('Aadhar Number:', i['Aadhar'])
                print('IFSC Code:', i['IFSC'])
                print('Account Number:', i['Account_num'])
                print('Balance:', i['Balance'])

                break

        if not found:
            print('---- Invalid Account Number ----')


obj = BANK()

while True:

    print('''
    1) Create Account
    2) Deposit
    3) Withdraw
    4) Check Balance
    5) Display Account Details
    6) Exit
    ''')

    n = int(input('Select one option: '))

    if n == 1:
        obj.create_Account()

    elif n == 2:
        obj.Deposit()

    elif n == 3:
        obj.Withdraw()

    elif n == 4:
        obj.check_balance()

    elif n == 5:
        obj.display_details()

    elif n == 6:
        print('Thank you for using SBI Bank!')
        break

    else:
        print('---- Invalid Option ----')