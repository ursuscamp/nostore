//
//  SwiftUIView.swift
//  Nostore
//
//  Created by Ryan Breen on 2/17/23.
//

import SwiftUI

struct PrivacyPolicyView: View {
    var body: some View {
        ScrollView {
            Text("Privacy Policy")
                .font(.largeTitle)
                .foregroundColor(.accentColor)
            Spacer(minLength: 20)
            Text("""
**Nostore** is developed in the spirit of Nostr.

You, the user, own your data. The developers of this app collect no data, anonymous or otherwise.

This code of this application is fully auditable and available on our [GitHub page](https://github.com/ursuscamp/nostore).
""").multilineTextAlignment(.leading)
        }.padding(.all)
    }
}

struct PrivacyPolicyView_Previews: PreviewProvider {
    static var previews: some View {
        PrivacyPolicyView()
    }
}
