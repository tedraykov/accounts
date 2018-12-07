import { accountsLink } from '@accounts/apollo-link';
import { AccountsClient, AccountsClientOptions } from '@accounts/client';
import AccountsGraphQLClient from '@accounts/graphql-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { ApolloLink } from 'apollo-link';
import { onError } from 'apollo-link-error';
import { HttpLink } from 'apollo-link-http';

// import { AccountsClientPasswordOptions } from '@accounts/client-password';

export interface AccountsApolloOptions extends AccountsClientOptions {
  uri: string;
  // password?: AccountsClientPasswordOptions;
  password?: any;
}

export const accountsApollo = (options: AccountsApolloOptions) => {
  // TODO optionally accept provided apollo client
  const apollo = new ApolloClient({
    cache: new InMemoryCache(),
    link: ApolloLink.from([
      onError(({ graphQLErrors, networkError }) => {
        if (graphQLErrors) {
          graphQLErrors.map(({ message, locations, path }) =>
            console.log(
              `[GraphQL Accounts Error]: Message: ${message}, Location: ${locations}, Path: ${path}`
            )
          );
        }
        if (networkError) {
          console.log(`[Network error]: ${networkError}`);
        }
      }),
      new HttpLink({
        uri: options.uri,
      }),
    ]),
  });

  const client = new AccountsClient(
    options,
    new AccountsGraphQLClient({
      graphQLClient: apollo,
    })
  );

  let password;
  if (require.resolve('@accounts/client-password')) {
    const AccountsClientPassword = require('@accounts/client-password').AccountsClientPassword; // tslint:disable-line no-implicit-dependencies
    password = new AccountsClientPassword(client, options.password);
  }

  return {
    client,
    apollo,
    link: accountsLink(client),
    password,
  };
};

export default accountsApollo;
