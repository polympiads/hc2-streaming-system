import { CommanderError, program } from "commander";
import { all_user_iterator, set_new_password } from "./net/users";
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import stringArgv from 'string-argv'
import { get_session_for_user, revoke_session } from "./net/session";

program.command('setpassword <user> <password>')
    .exitOverride()
    .description("Update the password of a user. This will revoke it's current session.")
    .action((user, password) => {
        if (typeof(user) != 'string') {
            console.log("Error : expected string as input for `user`")
            return;
        }
        if (typeof(password) != 'string') {
            console.log("Error : expected string as input for `password`")
            return;
        }

        if (!set_new_password(user, password)) {
            console.log("Error : Failed to update the password for this user. Make sur this user exists.");
        } else {
            console.log("Password updated successfully.");
        }
    })

program.command('listsessions')
    .exitOverride()
    .description("list all the opened sessions.")
    .action(() => {
        console.log(`USER_ID`.padEnd(36) + " " + "USER".padEnd(15) + " " + "SESSIONS".padEnd(36) + " " + "IP")
        for (let [username, user_id] of all_user_iterator()) {
            const session = get_session_for_user(user_id);
            
            process.stdout.write(`${user_id}`.padEnd(36) + " " + `${username}`.padEnd(15))
            if (session != undefined) {
                process.stdout.write(` ` + `${session.session_id}`.padEnd(36) + " " + `${session.ip_info}`)
            }
            process.stdout.write('\n');
        }
    })

program.command('revokesession <session_id>')
    .exitOverride()
    .description("Revoke the session.")
    .action((session) => {
        if (typeof(session) != 'string') {
            console.log("Error : expected string as input for `session`");
            return;
        }

        if (revoke_session(session)) {
            console.log("Session revoked.")
        } else {
            console.log("Session doesn't exists.");
        }
    })

var SHOULD_STOP = false
program.command('exit')
    .description("Make the server stop.")
    .action(() => {
        SHOULD_STOP = true
    })

program.exitOverride();

export async function launch_management_input() {
    const rl = readline.createInterface({input, output})
    
    while(!SHOULD_STOP) {
        const input = await rl.question("> ");
        const argv = stringArgv(input);

        // add the program and the script
        argv.splice(0, 0, "");
        argv.splice(0, 0, "");

        try {
            program.parse(argv);
        } catch (err) {
            if (err instanceof CommanderError) {
                
            }
        }
    }

    process.exit()
}
