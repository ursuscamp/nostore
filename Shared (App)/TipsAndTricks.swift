//
//  SwiftUIView.swift
//  Nostore
//
//  Created by Ryan Breen on 2/19/23.
//

import SwiftUI

struct TipsAndTricks: View {
    var body: some View {
        ScrollView {
            Text("Tips and Tricks")
                .font(.largeTitle)
                .foregroundColor(.accentColor)
            Spacer(minLength: 20.0)
            Text("Try a few of these:")
                .frame(maxWidth: .infinity, alignment: .leading)
            Spacer(minLength: 20)
            Text("""
1. You can have multiple profiles, each corresponding to a different key.

2. Click **Event History** in settings to see a list of all events signed by the extension.

3. Each client has its own set of permissions. You can review them at any time in **Settings**. They are organized by application host.

4. Clicking the event text in the **Event History** will copy a the raw event JSON.

5. If you have authorized the extension to talk to the client, but still don't see a special extension login button on the site, try hitting refresh on the site. The client may not recognize the extension code until you do that.
""")
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding([.horizontal], 25)
        }.padding(.all)
    }
}

struct Tipsandtricks_Previews: PreviewProvider {
    static var previews: some View {
        TipsAndTricks()
    }
}
